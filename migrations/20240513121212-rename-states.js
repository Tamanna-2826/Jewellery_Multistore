'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('states', 'States');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('States', 'states');
  }
};
