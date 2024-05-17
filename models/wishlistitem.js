'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WishlistItem extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Wishlist, {
        foreignKey: 'wishlist_id',
        as: 'wishlist',
        onDelete: 'CASCADE'
      });

      this.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
      });
    }
  }

  WishlistItem.init({
    wishlistItem_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    wishlist_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Wishlists',
        key: 'wishlist_id'
      },
      onDelete: 'CASCADE'
    },
    product_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'Products',
        key: 'product_id'
      },
      onDelete: 'CASCADE'
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'WishlistItem',
    paranoid: true
  });

  return WishlistItem;
};
