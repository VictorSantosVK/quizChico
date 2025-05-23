module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define('Quiz', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    category: DataTypes.STRING,
  });

  Quiz.associate = models => {
    Quiz.hasMany(models.Question, {
      foreignKey: 'quizId',
      as: 'questions'
    });
  };

  return Quiz;
};
