'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {

      order_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      order_date: {
        type: Sequelize.DATE
      },
   
      cgst: {
        type: Sequelize.DECIMAL
      },
      sgst: {
        type: Sequelize.DECIMAL
      },
      igst: {
        type: Sequelize.DECIMAL
      },
      subtotal: {
        type: Sequelize.DECIMAL
      },
      shipping_charges: {
        type: Sequelize.DECIMAL
      },
    
      coupon_id: {
        type: Sequelize.INTEGER
      },
      discount_value: {
        type: Sequelize.DECIMAL
      },
      discounted_amount: {
        type: Sequelize.DECIMAL
      },
      total_amount: {
        type: Sequelize.DECIMAL
      },
      address_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,

      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};