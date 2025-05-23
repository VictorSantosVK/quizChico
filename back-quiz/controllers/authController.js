const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body; // Role padrão como 'user'

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email já está em uso" });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 12); // Salt rounds aumentado para 12

    // Cria o usuário
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role 
    });

    // Remove a senha do objeto de retorno
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json(userResponse);

  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ 
      error: "Erro ao registrar usuário",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    // Busca o usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gera o token JWT usando a chave do .env
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'fallback_secret', // Usa a chave do .env ou um fallback
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1d' // Configurável via .env
      }
    );

    // Resposta sem a senha
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ 
      error: "Erro ao fazer login",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getUser = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.user.id
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] } // Não retorna a senha
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);

  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ 
      error: "Erro ao buscar informações do usuário",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getUser
};