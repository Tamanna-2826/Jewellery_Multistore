'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('cities', 'Cities');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('Cities', 'cities');
  }
};
