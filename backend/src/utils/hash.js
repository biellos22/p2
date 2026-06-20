const bcrypt = require("bcryptjs");

/**
 * Gera um hash seguro a partir de uma senha em texto puro.
 * @param {string} password - A senha a ser criptografada.
 * @returns {Promise<string>} O hash gerado.
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * Compara uma senha em texto puro com o hash salvo no banco.
 * @param {string} password - A senha em texto puro.
 * @param {string} hash - O hash salvo.
 * @returns {Promise<boolean>} Retorna true se houver correspondência, senão false.
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    hashPassword,
    comparePassword
};
