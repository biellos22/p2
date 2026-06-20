const test = require("node:test");
const assert = require("node:assert");
const { hashPassword, comparePassword } = require("../utils/hash");

test("Utilitário de Hash de Senhas", async (t) => {
    await t.test("deve gerar um hash diferente da senha original", async () => {
        const password = "senha_secreta_123";
        const hash = await hashPassword(password);
        
        assert.ok(hash);
        assert.notStrictEqual(hash, password);
        assert.strictEqual(hash.startsWith("$2"), true); // Indica que o hash foi gerado pelo bcrypt
    });

    await t.test("deve validar corretamente a senha correta e rejeitar a incorreta", async () => {
        const password = "outra_senha_forte";
        const hash = await hashPassword(password);
        
        const matches = await comparePassword(password, hash);
        assert.strictEqual(matches, true);
        
        const wrongMatches = await comparePassword("senha_incorreta", hash);
        assert.strictEqual(wrongMatches, false);
    });
});
