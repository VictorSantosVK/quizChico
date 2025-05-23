// controllers/userController.js
const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // oculta a senha
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};
exports.getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] }
  });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  await user.update(req.body);
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  await user.destroy();
  res.json({ message: 'Usuário excluído com sucesso' });
};
