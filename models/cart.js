"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {

    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
      });
      this.hasMany(models.CartItem, { foreignKey: 'cart_id', as: 'cartItems', onDelete: 'SET NULL' });

    }
  }
  Cart.init(
    {
      cart_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "user_id",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE
      },

    },
    {
      sequelize,
      modelName: "Cart",
      paranoid:true
    }
  );
  return Cart;
};
