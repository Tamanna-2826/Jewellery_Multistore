'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {

    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Order.belongsTo(models.Address, { foreignKey: 'address_id', as: 'address', onUpdate: 'SET NULL', onDelete: 'SET NULL'  });
      Order.belongsTo(models.Coupon, { foreignKey: 'coupon_id', as: 'discountCoupon', onUpdate: 'SET NULL', onDelete: 'SET NULL'  });
      Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'orderItems', onDelete: 'SET NULL' });
   
      //ADDED
      // Order.hasMany(models.Address, { as: 'addresses', foreignKey: 'order_id' }); 


    }
  }

  Order.init({
    order_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL' 
    },
    order_date: {
      type: DataTypes.DATE
    },
    cgst: {
      type: DataTypes.DECIMAL(10,2)
    },
    sgst: {
      type: DataTypes.DECIMAL(10,2)
    },
    igst: {
      type: DataTypes.DECIMAL(10,2)
    },
    subtotal: {
      type: DataTypes.DECIMAL(10,2)
    },
    shipping_charges: {
      type: DataTypes.DECIMAL(10,2)
    },
  
    coupon_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Coupons',
        key: 'coupon_id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL' 
    },
    discount_value: {
      type: DataTypes.DECIMAL(10,2)
    },
    discounted_amount: {
      type: DataTypes.DECIMAL(10,2)
    },
    total_amount: {
      type: DataTypes.DECIMAL(10,2)
    },

    address_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Addresses',
        key: 'address_id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL' 
    },
    status: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['pending', 'processing', 'shipped', 'out of delivery', 'delivered', 'cancelled','placed']]
    }
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,

    }
  }, {
    sequelize,
    modelName: 'Order',
    paranoid: true
  });

  return Order;
};
