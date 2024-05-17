'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      this.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart',onDelete: 'SET NULL'});
      
      this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product',onDelete: 'SET NULL' });

      this.belongsTo(models.User, { 
        through: models.Cart,
        foreignKey: 'cart_id', 
        otherKey: 'user_id',
        as: 'buyer' 
      });
    }
  }

  CartItem.init({
    cartItem_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    cart_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: "Carts",
        key: "cart_id",
      },
    },
    product_id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "product_id",
      },
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    price: {
      allowNull: false,
      type: DataTypes.DECIMAL(10, 2),
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    paranoid: true
  });

  return CartItem;
};
