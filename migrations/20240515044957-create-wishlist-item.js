'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WishlistItems', {
      wishlistItem_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      wishlist_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Wishlists', 
          key: 'wishlist_id', 
        },
        onDelete: 'CASCADE'
      },
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Products', 
          key: 'product_id', 
        },
        onDelete: 'CASCADE'
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
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WishlistItems');
  }
};
