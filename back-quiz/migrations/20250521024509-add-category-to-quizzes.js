module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Quizzes', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Quizzes', 'category');
  },
};
