const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { validateQuestion } = require("../middlewares/validation");

// Criar nova questão
router.post("/", validateQuestion, async (req, res, next) => {
  try {
    await questionController.create(req, res);
  } catch (error) {
    next(error);
  }
});

// Obter questões pelo quizId
router.get("/:quizId", async (req, res, next) => {
  try {
    await questionController.getByQuiz(req, res);
  } catch (error) {
    next(error);
  }
});

// Atualizar questão
router.put("/:id", validateQuestion, async (req, res, next) => {
  try {
    await questionController.update(req, res);
  } catch (error) {
    next(error);
  }
});

// Deletar questão
router.delete("/:id", async (req, res, next) => {
  try {
    await questionController.delete(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
