module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: 'student' }
  });

  User.associate = function(models) {
    User.hasMany(models.UserQuiz, { foreignKey: 'userId' });
  };

  return User;
};