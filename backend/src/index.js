const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const app = express()
app.use(helmet())
app.set('trust proxy', 1)
const port = process.env.PORT || 3000


//db
const conn = require("./db/conn");

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
const mongoSanitize = require("express-mongo-sanitize");

app.use(cors({
    origin: frontendUrl
}));
app.use(express.json());
app.use(mongoSanitize());

const routes = require("./routes/user");

app.use("/api", routes);

// Conecta ao banco e inicia o servidor após a conexão e o seeding
conn().then(async () => {
    try {
        const { User } = require("./models/user");
        const adminUser = await User.findOne({ user: "admin" });
        if (!adminUser) {
            console.log("Usuário administrador padrão não encontrado. Semeando...");
            const { hashPassword } = require("./utils/hash");
            const hashedSenha = await hashPassword("admin");
            await User.create({
                user: "admin",
                senha: hashedSenha,
                funcao: "admin"
            });
            console.log("Usuário administrador padrão semeado com sucesso! (User: 'admin', Senha: 'admin')");
        }
    } catch (error) {
        console.error("Erro ao semear banco de dados de usuários:", error);
    }

    app.listen(port, () => {
        console.log(`app rodando em http:localhost:${port}`)
    });
}).catch((error) => {
    console.error("Erro crítico na inicialização do servidor:", error);
    process.exit(1);
});
