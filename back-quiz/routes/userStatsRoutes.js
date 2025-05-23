const express = require('express');
const router = express.Router();
const { UserQuiz, Quiz } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userQuizzes = await UserQuiz.findAll({
      where: { userId },
      include: [{
        model: Quiz,
        attributes: ['id', 'title', 'category']
      }],
      order: [['completedAt', 'DESC']]
    });

    const quizzesCompleted = userQuizzes.length;
    const totalScore = userQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = quizzesCompleted > 0 
      ? Math.round((totalScore / quizzesCompleted) * 10) / 10 
      : 0;

    res.json({
      averageScore,
      quizzesCompleted,
      recentQuizzes: userQuizzes.map(quiz => ({
        id: quiz.Quiz.id,
        title: quiz.Quiz.title,
        category: quiz.Quiz.category,
        score: quiz.score,
        completedAt: quiz.completedAt
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas do usuário' });
  }
});

module.exports = router;