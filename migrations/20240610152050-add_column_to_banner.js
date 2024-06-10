'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Banners', 'category', {
      type: Sequelize.STRING,
      allowNull: true,

    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Banners', 'category');
  }
};
