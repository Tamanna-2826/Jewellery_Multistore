'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Payments', 'payment_intent_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Payments', 'payment_intent_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
