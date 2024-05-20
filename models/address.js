'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {

      Address.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'user'

      });

      Address.belongsTo(models.State, {
        foreignKey: 'state_id',
        onDelete: 'CASCADE',
        as: 'state'

      });

      Address.belongsTo(models.City, {
        foreignKey: 'city_id',
        onDelete: 'CASCADE',
        as: 'city'

      });
    
    }
  }

  Address.init({
    address_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
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
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_no: {
      type: DataTypes.STRING(10), 
      allowNull: false,
      validate: {
        len: [10, 10], 
        isNumeric: true, 
      },
    },
    street_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cities',
        key: 'city_id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL' 
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'States',
        key: 'state_id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL' 
    },
    pincode: {
      type: DataTypes.STRING(6), 
      allowNull: false,
      validate: {
        len: [6, 6], 
        isNumeric: true, 
      },
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'India'
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    address_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'Address',
    paranoid:true
  });

  return Address;
};
