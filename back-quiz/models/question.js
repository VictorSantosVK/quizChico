module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    text: DataTypes.STRING,
    options: DataTypes.JSON,
    correctOption: DataTypes.STRING,
    quizId: DataTypes.INTEGER
  });

  Question.associate = models => {
    Question.belongsTo(models.Quiz, {
      foreignKey: 'quizId',
      as: 'quiz'
    });
  };

  return Question;
};
