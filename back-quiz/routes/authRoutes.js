const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { User } = require("../models");

// ✅ Registrar usuário
router.post("/register", authController.register);

// ✅ Login de usuário
router.post("/login", authController.login);

// ✅ GET todos os usuários (remova se quiser proteger depois)
router.get("/usuarios", async (req, res, next) => {
  try {
    const usuarios = await User.findAll({
      attributes: { exclude: ["password"] }
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

// ✅ UserController: get, update, delete
router.get("/usuarios/:id", userController.getUserById);
router.put("/usuarios/:id", userController.updateUser);
router.delete("/usuarios/:id", userController.deleteUser);

module.exports = router;
