const express = require('express');
const router = express.Router();
const { User, UserQuiz } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const ranking = await UserQuiz.findAll({
            attributes: [
                'userId',
                [UserQuiz.sequelize.fn('AVG', UserQuiz.sequelize.col('score')), 'averageScore']
            ],
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            group: ['userId', 'User.id'], // Agrupamento correto
            order: [
                // Ordena pela média de pontuação (maior primeiro)
                [UserQuiz.sequelize.literal('AVG(score)'), 'DESC']
            ],
            raw: true
        });

        // Formata os resultados
        const formattedRanking = ranking.map(item => ({
            id: item['User.id'],
            name: item['User.name'],
            email: item['User.email'],
            averageScore: Math.round(item.averageScore) // Arredonda para inteiro
        }));

        res.json({
            success: true,
            data: formattedRanking
        });

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao gerar ranking',
            message: error.message
        });
    }
});

module.exports = router;