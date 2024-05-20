'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Cart, { foreignKey: 'user_id', as: 'carts' });

      User.hasMany(models.Address, { foreignKey: 'user_id', as: 'addresses' });


    }
  }
  User.init({
    user_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,

    },
    last_name:{
      type: DataTypes.STRING,
      allowNull: false,

    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,

    },
    country_code: {
      type: DataTypes.STRING,
      defaultValue: '91',

    },
    phone_no: {
      type: DataTypes.STRING,
      allowNull: false,

      validate: {
        notNull: true,
        is: /^\d{10}$/, // Validates 10 digits
      },
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'User',
    paranoid:true
  });
  return User;
};