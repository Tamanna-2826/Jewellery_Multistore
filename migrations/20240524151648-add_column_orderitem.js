'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.removeColumn('OrderItems', 'vendor_status', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('OrderItems', 'vendor_status', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.addColumn('OrderItems', 'order_received', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('OrderItems', 'processing', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('OrderItems', 'shipped', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('OrderItems', 'out_for_delivery', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('OrderItems', 'delivered', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('OrderItems', 'vendor_status', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.removeColumn('OrderItems', 'order_received');
    await queryInterface.removeColumn('OrderItems', 'processing');
    await queryInterface.removeColumn('OrderItems', 'shipped');
    await queryInterface.removeColumn('OrderItems', 'out_for_delivery');
    await queryInterface.removeColumn('OrderItems', 'delivered');
  }
};
