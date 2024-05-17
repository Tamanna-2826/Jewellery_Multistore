'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Category.init({
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true, 
      autoIncrement: true, 
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_image: {
      type: DataTypes.STRING, 
    },
    deletedAt:{
      type:DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Category',
    paranoid: true
  });
  return Category;
};