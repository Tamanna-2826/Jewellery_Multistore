'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.removeColumn('Orders', 'status', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('Orders', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.addColumn('Orders', 'order_placed', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Orders', 'processing', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Orders', 'shipped', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Orders', 'out_for_delivery', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Orders', 'delivered', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.removeColumn('Orders', 'order_placed');
    await queryInterface.removeColumn('Orders', 'processing');
    await queryInterface.removeColumn('Orders', 'shipped');
    await queryInterface.removeColumn('Orders', 'out_for_delivery');
    await queryInterface.removeColumn('Orders', 'delivered');
  }
};
