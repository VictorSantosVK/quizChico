// routes/userRoutes.js
router.get('/ranking', authMiddleware, async (req, res) => {
    try {
        // Busca todos os usuários com suas pontuações médias
        const ranking = await UserQuiz.findAll({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('score')), 'averageScore'],
                'userId'
            ],
            include: [{
                model: User,
                attributes: ['name']
            }],
            group: ['userId'],
            order: [[sequelize.fn('AVG', sequelize.col('score')), 'DESC']],
            raw: true
        });

        // Formata os dados para resposta
        const formattedRanking = ranking.map(item => ({
            id: item.userId,
            name: item['User.name'],
            averageScore: Math.round(item.averageScore)
        }));

        res.json(formattedRanking);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});