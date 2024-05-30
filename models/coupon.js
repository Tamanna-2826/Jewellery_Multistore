'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {

    static associate(models) {
      Coupon.hasOne(models.Order, { foreignKey: 'coupon_id', as: 'order', onDelete: "SET NULL" , onUpdate:"SET NULL"});
      Coupon.belongsTo(models.Vendor, { foreignKey: 'vendor_id', as: 'vendor', onDelete: "SET NULL" });

    }
  }
  
  Coupon.init({
    coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vendors', 
        key: 'vendor_id'
      },
      onDelete: "SET NULL"
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discount_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL,
      allowNull: false
      
    },
    minimum_amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    maximum_uses: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedAt:{
      type:DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Coupon',
    paranoid:true
  });

  return Coupon;
};
