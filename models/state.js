'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class State extends Model {

    static associate(models) {
      // define association here
    }
  }
  State.init({
    state_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    state_name: {
      type: DataTypes.STRING
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  },
  
  {
    sequelize,
    modelName: 'State',
    paranoid:true
  });
  return State;
};