'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VendorKYCs', {
      kyc_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Vendors',
          key: 'vendor_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      business_reg_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
     
      aadhar_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      aadhar_copy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pan_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pan_copy: {
        type: Sequelize.STRING,
        allowNull: true
      },
      add_prof: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bank_acc_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bank_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ifsc_code: {
        type: Sequelize.STRING,
        allowNull: false
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VendorKYCs');
  }
};
