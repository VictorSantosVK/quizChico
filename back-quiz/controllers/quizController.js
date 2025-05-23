const { Quiz, Question, sequelize } = require('../models');

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, category, isActive, questions } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      category,
      isActive,
      questions
    }, {
      include: [{ model: Question, as: 'questions' }],
      transaction: t
    });

    await t.commit();
    res.status(201).json(quiz);
  } catch (err) {
    await t.rollback();
    console.error('Erro ao criar quiz:', err);
    res.status(400).json({ 
      error: 'Erro ao criar quiz',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: quizzes } = await Quiz.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Question, as: 'questions' }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      quizzes
    });
  } catch (err) {
    console.error('Erro ao buscar quizzes:', err);
    res.status(500).json({ 
      error: 'Erro ao buscar quizzes',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: Question, as: 'questions' }]
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }

    res.json(quiz);
  } catch (err) {
    console.error('Erro ao buscar quiz:', err);
    res.status(500).json({ 
      error: 'Erro ao buscar quiz',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const quiz = await Quiz.findByPk(req.params.id, { 
      include: [{ model: Question, as: 'questions' }],
      transaction: t 
    });
    
    if (!quiz) {
      await t.rollback();
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }

    // Atualiza os dados básicos do quiz
    await quiz.update({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      isActive: req.body.isActive
    }, { transaction: t });

    // Processa as perguntas
    if (req.body.questions && Array.isArray(req.body.questions)) {
      // Remove todas as questões existentes
      await Question.destroy({
        where: { quizId: quiz.id },
        transaction: t
      });

      // Cria as novas questões
      await Promise.all(req.body.questions.map(question => 
        Question.create({
          text: question.text,
          options: question.options,
          correctOption: question.correctOption,
          quizId: quiz.id
        }, { transaction: t })
      )); // Removi o parêntese extra aqui
    }

    await t.commit();
    res.json(await Quiz.findByPk(quiz.id, { include: [{ model: Question, as: 'questions' }] }));
  } catch (err) {
    await t.rollback();
    console.error('Erro ao atualizar quiz:', err);
    res.status(400).json({ error: 'Erro ao atualizar quiz' });
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const quiz = await Quiz.findByPk(req.params.id, { transaction: t });
    if (!quiz) {
      await t.rollback();
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }

    // Primeiro exclui todas as perguntas relacionadas
    await Question.destroy({ 
      where: { quizId: quiz.id },
      transaction: t
    });

    // Depois exclui o quiz
    await quiz.destroy({ transaction: t });
    
    await t.commit();
    res.json({ message: 'Quiz excluído com sucesso' });
  } catch (err) {
    await t.rollback();
    console.error('Erro ao excluir quiz:', err);
    res.status(500).json({ 
      error: 'Erro ao excluir quiz',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};