'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {

    static associate(models) {
      // define association here

      City.belongsTo(models.State, {
        foreignKey: 'state_id', 
        onDelete: 'SET NULL', 
        onUpdate: 'SET NULL',
      });
    }
  }
  City.init({
    city_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    state_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'State', 
        key: 'state_id',
      },
    },
   
    city_name: {
      type: DataTypes.STRING
    },
    deletedAt:{
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'City',
    paranoid:true
  });
  return City;
};