const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { msg: "Muitas tentativas de login a partir deste IP, por favor tente novamente após um minuto." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
    loginLimiter
};
