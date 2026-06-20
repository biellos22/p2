const router = require("express").Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");
const { loginLimiter } = require("../middlewares/rateLimiter");

router.route("/user").post(authMiddleware, adminOnly, (req, res) => userController.create(req, res));
router.route("/user").get(authMiddleware, adminOnly, (req, res) => userController.getAll(req, res));
router.route("/user/:id").get(authMiddleware, adminOnly, (req, res) => userController.get(req, res));
router.route("/user/:id").delete(authMiddleware, adminOnly, (req, res) => userController.delete(req, res));
router.route("/user/:id").put(authMiddleware, adminOnly, (req, res) => userController.update(req, res));
router.route("/login").post(loginLimiter, (req, res) => userController.login(req, res));
router.route("/logout").post(authMiddleware, (req, res) => userController.logout(req, res));

  
  // Rota para processar o login


module.exports = router;