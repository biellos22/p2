const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
const Blacklist = require("../models/blacklist");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "Token não fornecido" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ msg: "Erro no token" });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ msg: "Token malformatado" });
  }

  Blacklist.findOne({ token })
    .then((blacklisted) => {
      if (blacklisted) {
        return res.status(401).json({ msg: "Token revogado (sessão encerrada)" });
      }

      jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ msg: "Token inválido" });
        }

        req.userId = decoded.id;
        req.userFuncao = decoded.funcao;
        return next();
      });
    })
    .catch((err) => {
      console.error("Erro ao consultar blacklist:", err);
      return res.status(500).json({ msg: "Erro interno do servidor ao verificar token." });
    });
};
