'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {

    static associate(models) {

      Vendor.belongsTo(models.City, {
        foreignKey: 'city_id',
        as:'city',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });

      Vendor.belongsTo(models.State, {
        foreignKey: 'state_id',
        as:'state',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      Vendor.hasOne(models.VendorKYC, {
        foreignKey: 'vendor_id',
        as: 'kycDetails'
      });
      Vendor.hasMany(models.Coupon, {
        foreignKey: 'vendor_id',
        as: 'coupons'
      });

      //added
      Vendor.hasMany(models.Product, {
        foreignKey: 'vendor_id',
        as: 'products'
      });
    }
  }
  Vendor.init({
    vendor_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    first_name: {
      type: DataTypes.STRING
    },
    last_name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    country_code: {
      type: DataTypes.STRING
    },
    phone_no: {
      type: DataTypes.STRING
    },
    gstno: {
      type: DataTypes.STRING
    },
    city_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Cities',
        key: 'city_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' 
    },
    state_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'States',
        key: 'state_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' 
    },
    address: {
      type: DataTypes.STRING
    },
    company_name: {
      type: DataTypes.STRING
    },
    active_status: {
      type: DataTypes.STRING
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Vendor',
    paranoid:true
  });
  return Vendor;
};