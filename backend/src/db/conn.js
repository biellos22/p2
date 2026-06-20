const mongoose = require("mongoose");

async function main() {
    try {
        mongoose.set("strictQuery", true);
        
        const dbUri = process.env.MONGODB_URI;
        if (!dbUri) {
            throw new Error("A variável de ambiente MONGODB_URI não está definida. Defina MONGODB_URI para conectar ao banco de dados.");
        }
        
        await mongoose.connect(dbUri);
        console.log("Conectado ao MongoDB com sucesso!");
    } catch (error) {
        console.error(`Erro crítico no banco de dados: ${error.message}`);
        // Encerra a aplicação caso o banco de dados não consiga se conectar
        process.exit(1);
    }
}

module.exports = main;