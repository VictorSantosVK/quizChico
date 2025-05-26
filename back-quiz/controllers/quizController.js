const { Quiz, Question, UserQuiz, sequelize } = require('../models');

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, category, isActive, questions } = req.body;

    // Validação básica
    if (!title || !category) {
      await t.rollback();
      return res.status(400).json({ error: 'Título e categoria são obrigatórios' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      isActive: isActive !== false, // default true
    }, { transaction: t });

    // Processa as perguntas se existirem
    if (questions && Array.isArray(questions)) {
      await Promise.all(questions.map(question => 
        Question.create({
          text: question.text,
          options: question.options || [],
          correctOption: question.correctOption,
          quizId: quiz.id
        }, { transaction: t })
      ));
    }

    await t.commit();
    res.status(201).json(await Quiz.findByPk(quiz.id, {
      include: [{ model: Question, as: 'questions' }]
    }));
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
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.title = { [sequelize.Op.like]: `%${search}%` };
    }
    
    const { count, rows: quizzes } = await Quiz.findAndCountAll({
      where,
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

    // Validação básica
    if (!req.body.title || !req.body.category) {
      await t.rollback();
      return res.status(400).json({ error: 'Título e categoria são obrigatórios' });
    }

    // Atualiza os dados básicos do quiz
    await quiz.update({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      isActive: req.body.isActive !== false
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
          options: question.options || [],
          correctOption: question.correctOption,
          quizId: quiz.id
        }, { transaction: t })
      ));
    }

    await t.commit();
    res.json(await Quiz.findByPk(quiz.id, { 
      include: [{ model: Question, as: 'questions' }] 
    }));
  } catch (err) {
    await t.rollback();
    console.error('Erro ao atualizar quiz:', err);
    res.status(400).json({ 
      error: 'Erro ao atualizar quiz',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

    // 1. Remove todos os UserQuizzes associados
    await UserQuiz.destroy({ 
      where: { quizId: quiz.id },
      transaction: t 
    });

    // 2. Remove todas as questões
    await Question.destroy({ 
      where: { quizId: quiz.id },
      transaction: t 
    });

    // 3. Finalmente remove o quiz
    await quiz.destroy({ transaction: t });
    
    await t.commit();
    res.json({ message: 'Quiz excluído com sucesso' });
  } catch (err) {
    await t.rollback();
    console.error('Erro ao excluir quiz:', err);
    
    let statusCode = 500;
    let errorMessage = 'Erro ao excluir quiz';
    
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      statusCode = 400;
      errorMessage = 'Não foi possível excluir o quiz devido a registros vinculados';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};