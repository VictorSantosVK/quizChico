const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  // Verifica se o token está no header ou nos cookies
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Acesso não autorizado. Token não fornecido.' 
    });
  }

  try {
    // Verifica o token com a chave secreta do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adiciona as informações do usuário à requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user' // Padrão para 'user' se não especificado
    };
    
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    
    // Respostas específicas para diferentes tipos de erro
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Token inválido',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expirado',
        solution: 'Por favor, faça login novamente'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro na autenticação',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};