const { Question, sequelize } = require('../models');

exports.create = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    console.error('Erro ao criar questão:', err);
    res.status(400).json({ 
      error: 'Erro ao criar questão',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getByQuiz = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { quizId: req.params.quizId },
      order: [['createdAt', 'ASC']]
    });
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'Nenhuma questão encontrada para este quiz' });
    }
    
    res.json(questions);
  } catch (err) {
    console.error('Erro ao buscar questões:', err);
    res.status(500).json({ 
      error: 'Erro ao buscar questões',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const question = await Question.findByPk(req.params.id, { transaction: t });
    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    await question.update(req.body, { transaction: t });
    await t.commit();
    
    const updatedQuestion = await Question.findByPk(req.params.id);
    res.json(updatedQuestion);
  } catch (err) {
    await t.rollback();
    console.error('Erro ao atualizar questão:', err);
    res.status(400).json({ 
      error: 'Erro ao atualizar questão',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const question = await Question.findByPk(req.params.id, { transaction: t });
    if (!question) {
      await t.rollback();
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    await question.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Questão excluída com sucesso' });
  } catch (err) {
    await t.rollback();
    console.error('Erro ao excluir questão:', err);
    res.status(500).json({ 
      error: 'Erro ao excluir questão',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};