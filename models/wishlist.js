'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });

      this.hasMany(models.WishlistItem, {
        foreignKey: 'wishlist_id',
        as: 'wishlistItems',
        onDelete: 'CASCADE'
      });
    }
  }

  Wishlist.init({
    wishlist_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL'
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Wishlist',
    paranoid: true
  });

  return Wishlist;
};
