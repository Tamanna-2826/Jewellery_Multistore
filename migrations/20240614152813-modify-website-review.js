'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('WebsiteReviews', 'user_id');
    await queryInterface.addColumn('WebsiteReviews', 'first_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('WebsiteReviews', 'last_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('WebsiteReviews', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.removeColumn('WebsiteReviews', 'first_name');
    await queryInterface.removeColumn('WebsiteReviews', 'last_name');
  }
};
