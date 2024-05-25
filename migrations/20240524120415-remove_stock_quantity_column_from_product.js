'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'stock_quantity');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'stock_quantity', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
