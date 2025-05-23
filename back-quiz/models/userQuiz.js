module.exports = (sequelize, DataTypes) => {
  const UserQuiz = sequelize.define('UserQuiz', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  UserQuiz.associate = function(models) {
    UserQuiz.belongsTo(models.User, { foreignKey: 'userId' });
    UserQuiz.belongsTo(models.Quiz, { foreignKey: 'quizId' });
  };

  return UserQuiz;
};