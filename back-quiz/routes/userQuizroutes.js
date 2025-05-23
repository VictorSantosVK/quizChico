const express = require('express');
const router = express.Router();
const { UserQuiz } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { quizId, score } = req.body;
    const userId = req.user.id;

    // Verifica se o quiz existe
    const existingQuiz = await UserQuiz.findOne({ 
      where: { userId, quizId } 
    });

    if (existingQuiz) {
      // Atualiza o resultado existente
      await existingQuiz.update({ score });
      return res.json({
        message: 'Resultado atualizado com sucesso',
        result: existingQuiz
      });
    }

    // Cria um novo resultado
    const result = await UserQuiz.create({
      userId,
      quizId,
      score
    });

    res.status(201).json({
      message: 'Resultado registrado com sucesso',
      result
    });

  } catch (error) {
    console.error('Erro ao registrar quiz:', error);
    res.status(400).json({ error: 'Erro ao registrar quiz' });
  }
});

module.exports = router;