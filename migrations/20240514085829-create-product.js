'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      product_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'category_id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL' 
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Vendors', 
          key: 'vendor_id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL' 
      },
      product_name: {
        type: Sequelize.STRING
      },
      p_images: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      main_description: {
        type: Sequelize.TEXT
      },
      mrp: {
        type: Sequelize.DECIMAL
      },
      selling_price: {
        type: Sequelize.DECIMAL
      },
      vendor_price: {
        type: Sequelize.DECIMAL
      },
      clasp_type: {
        type: Sequelize.STRING
      },
      gem_type: {
        type: Sequelize.STRING
      },
      gem_color: {
        type: Sequelize.STRING
      },
      occasion_type: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.STRING
      },
      ratings: {
        type: Sequelize.DECIMAL
      },
      basic_description: {
        type: Sequelize.STRING
      },
      gold_type: {
        type: Sequelize.STRING
      },
      no_of_gems: {
        type: Sequelize.INTEGER
      },
      purity: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt:{
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};