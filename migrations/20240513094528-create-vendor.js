'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vendors', {

      vendor_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      country_code: {
        type: Sequelize.STRING,
        defaultValue: '91',
      },
      phone_no: {
        type: Sequelize.STRING
      },
      gstno: {
        type: Sequelize.STRING
      },
      city_id: {
        type: Sequelize.INTEGER,references: {
          model: 'Cities',
          key: 'city_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' 
      },
      state_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'States',
          key: 'state_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' 
      },
      address: {
        type: Sequelize.STRING
      },
      company_name: {
        type: Sequelize.STRING
      },
      active_status: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vendors');
  }
};