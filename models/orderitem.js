'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // Define associations with aliases
      OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order', onDelete: 'SET NULL' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', onDelete: 'SET NULL' });
    }
  }

  OrderItem.init({
    orderItem_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Order',
        key: 'order_id'
      },
      onDelete: 'SET NULL'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Product',
        key: 'product_id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    cgst: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    sgst: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    igst: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    sub_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    vendor_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'order received',
      validate: {
        isIn: [['order received', 'processing', 'shipped','out for delivery','delivered']]
    }
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    paranoid:true
  });

  return OrderItem;
};
