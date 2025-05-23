exports.validateQuiz = (req, res, next) => {
  const { title, description, category } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Título é obrigatório' });
  }
  
  if (!description) {
    return res.status(400).json({ error: 'Descrição é obrigatória' });
  }
  
  if (!category) {
    return res.status(400).json({ error: 'Categoria é obrigatória' });
  }
  
  next();
};

exports.validateQuestion = (req, res, next) => {
  const { text, options, correctAnswer, quizId } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Texto da questão é obrigatório' });
  }
  
  if (!options || !Array.isArray(options)) {
    return res.status(400).json({ error: 'Opções da questão são obrigatórias' });
  }
  
  if (correctAnswer === undefined || correctAnswer === null) {
    return res.status(400).json({ error: 'Resposta correta é obrigatória' });
  }
  
  if (!quizId) {
    return res.status(400).json({ error: 'ID do quiz é obrigatório' });
  }
  
  next();
};