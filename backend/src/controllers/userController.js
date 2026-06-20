const {User: UserModel} = require("../models/user");
const userRepository = require("../repository/userRepository");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/hash");
const Blacklist = require("../models/blacklist");

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    console.error("Erro crítico: A variável de ambiente JWT_SECRET é obrigatória para a segurança do sistema e não está definida no Node backend.");
    process.exit(1);
}

if (SECRET === 'chave_secreta_super_segura' || SECRET === 'sua_chave_secreta_super_segura') {
    console.warn("AVISO DE SEGURANÇA: Usando a chave secreta JWT padrão/previsível. Altere para produção!");
}

const userController = {

        create : async(req, res) => {
            try {
                const { user, senha, funcao } = req.body;
                
                if (!user || !senha || !funcao) {
                    return res.status(400).json({ msg: "Campos obrigatórios (user, senha, funcao) faltando" });
                }

                const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
                if (!usernameRegex.test(user)) {
                    return res.status(400).json({ msg: "O nome de usuário deve ser alfanumérico e ter entre 3 e 20 caracteres." });
                }

                if (senha.length < 8) {
                    return res.status(400).json({ msg: "A senha deve conter no mínimo 8 caracteres." });
                }

                if (funcao !== 'admin' && funcao !== 'funcionario') {
                    return res.status(400).json({ msg: "Função inválida. Deve ser 'admin' ou 'funcionario'." });
                }

                const existingUser = await UserModel.findOne({ user });
                if (existingUser) {
                    return res.status(409).json({ msg: "Este usuário já está cadastrado." });
                }

                const hashedSenha = await hashPassword(senha);
                const response = await userRepository.create({ user, senha: hashedSenha, funcao });
                const userObj = response.toObject();
                delete userObj.senha;
                return res.status(201).json({ response: userObj, msg: "criado" });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg: "Erro interno do servidor ao criar usuário." });
            }
        },

        getAll : async(req, res) => {
            try {
                const users = await userRepository.findAll();
                const sanitizedUsers = users.map(u => {
                    const obj = u.toObject();
                    delete obj.senha;
                    return obj;
                });
                return res.json(sanitizedUsers);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg: "Erro interno do servidor ao buscar usuários." });
            }
        },

        get: async(req, res) => {
            try {
                const id = req.params.id;
                const user = await userRepository.findOne(id);

                if(!user) {
                    return res.status(404).json({ msg: "Usuário não localizado." });
                }

                const userObj = user.toObject();
                delete userObj.senha;
                return res.json(userObj);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg: "Erro interno do servidor ao buscar usuário." });
            }
        },

        delete: async(req, res) => {
            try {
                const id = req.params.id;

                if (String(id) === String(req.userId)) {
                    return res.status(400).json({ msg: "Você não pode excluir o seu próprio usuário." });
                }

                const user = await userRepository.findOne(id);

                if(!user) {
                    return res.status(404).json({ msg: "Usuário não localizado." });
                }

                await userRepository.delete(id);
                return res.status(200).json({ msg: "Usuário deletado" });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg: "Erro interno do servidor ao deletar usuário." });
            }
        },

        update: async (req, res) => {
            try {
                const id = req.params.id;
                const { user, senha, funcao } = req.body;

                if (!user || !funcao) {
                    return res.status(400).json({ msg: "Campos user e funcao são obrigatórios." });
                }

                const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
                if (!usernameRegex.test(user)) {
                    return res.status(400).json({ msg: "O nome de usuário deve ser alfanumérico e ter entre 3 e 20 caracteres." });
                }

                if (funcao !== 'admin' && funcao !== 'funcionario') {
                    return res.status(400).json({ msg: "Função inválida. Deve ser 'admin' ou 'funcionario'." });
                }

                const updateData = { user, funcao };
                if (senha !== undefined && senha !== "") {
                    if (senha.length < 8) {
                        return res.status(400).json({ msg: "A senha deve conter no mínimo 8 caracteres." });
                    }
                    updateData.senha = await hashPassword(senha);
                }

                const updatedUser = await userRepository.update(id, updateData);

                if(!updatedUser) {
                    return res.status(404).json({ msg: "Usuário não encontrado." });
                }

                const userObj = updatedUser.toObject();
                delete userObj.senha;
                return res.status(200).json({ user: userObj, msg: "Usuário atualizado com sucesso" });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg: "Erro interno do servidor ao atualizar usuário." });
            }
        },

        login: async (req, res) => {
            try {
                const { user: loginUser, senha } = req.body;

                if (!loginUser || !senha) {
                    return res.status(400).json({ msg: "Usuário e senha são obrigatórios." });
                }

                if (typeof loginUser !== "string" || typeof senha !== "string") {
                    return res.status(400).json({ msg: "Os campos de usuário e senha devem ser do tipo texto." });
                }

                const user = await userRepository.findByName(loginUser);
                if (!user) {
                    return res.status(401).json({ msg: "Usuário ou senha inválidos." });
                }

                const isPasswordValid = await comparePassword(senha, user.senha);
                if (!isPasswordValid) {
                    return res.status(401).json({ msg: "Usuário ou senha inválidos." });
                }

                const token = jwt.sign(
                    { id: user._id, funcao: user.funcao },
                    SECRET,
                    { expiresIn: "1d" }
                );

                return res.status(200).json({
                    token,
                    user: {
                        id: user._id,
                        user: user.user,
                        funcao: user.funcao
                    },
                    msg: "Login realizado com sucesso"
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg: "Erro interno do servidor durante o login." });
            }
        },

        logout: async (req, res) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader) {
                    return res.status(400).json({ msg: "Token não fornecido" });
                }
                const token = authHeader.split(" ")[1];
                if (!token) {
                    return res.status(400).json({ msg: "Token não fornecido" });
                }
                
                const decoded = jwt.decode(token);
                const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

                await Blacklist.findOneAndUpdate(
                    { token },
                    { token, expiresAt },
                    { upsert: true, new: true }
                );

                return res.status(200).json({ msg: "Logout realizado com sucesso. Token revogado." });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg: "Erro interno do servidor ao realizar logout." });
            }
        }
};

module.exports = userController;
