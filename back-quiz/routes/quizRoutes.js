const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { validateQuiz } = require("../middlewares/validation");

// Criar quiz
router.post("/", validateQuiz, async (req, res, next) => {
  try {
    await quizController.create(req, res);
  } catch (error) {
    next(error);
  }
});

// Listar todos quizzes com paginação
router.get("/", async (req, res, next) => {
  try {
    await quizController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

// Obter quiz por ID
router.get("/:id", async (req, res, next) => {
  try {
    await quizController.getById(req, res);
  } catch (error) {
    next(error);
  }
});

// Atualizar quiz
router.put("/:id", validateQuiz, async (req, res, next) => {
  try {
    await quizController.update(req, res);
  } catch (error) {
    next(error);
  }
});

// Deletar quiz
router.delete("/:id", async (req, res, next) => {
  try {
    await quizController.delete(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;