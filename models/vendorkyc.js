'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VendorKYC extends Model {
    static associate(models) {
      VendorKYC.belongsTo(models.Vendor, {
        foreignKey: 'vendor_id',
        as: 'vendor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  VendorKYC.init({
    kyc_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Vendors',
        key: 'vendor_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    business_reg_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
   
    aadhar_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    aadhar_copy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pan_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pan_copy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    add_prof: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bank_acc_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ifsc_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'VendorKYC',
    timestamps: true
  });
  return VendorKYC;
};
