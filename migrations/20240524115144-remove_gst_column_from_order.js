'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'cgst');
    await queryInterface.removeColumn('Orders', 'sgst');
    await queryInterface.removeColumn('Orders', 'igst');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'cgst', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'sgst', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'igst', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true
    });
  }
};
