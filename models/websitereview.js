'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WebsiteReview extends Model {
    static associate(models) {
      WebsiteReview.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }
  WebsiteReview.init({
    review_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ratings: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'WebsiteReview',
    paranoid:true
  });

  return WebsiteReview;
};
