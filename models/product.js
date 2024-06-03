"use strict";
const { database } = require("firebase-admin");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
        onDelete:"SET NULL",
        onUpdate:"SET NULL"
      });

      Product.belongsTo(models.Vendor, {
        foreignKey: "vendor_id",
        as: "vendor",
        onDelete:"SET NULL",
        onUpdate:"SET NULL"
      });

      //Added
      Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });


    }
  }

  Product.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'category_id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL' 
      },
      vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Vendors', 
          key: 'vendor_id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL' 
      },
      product_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      p_images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      main_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mrp: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      selling_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      vendor_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      clasp_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gem_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gem_color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      occasion_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      weight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ratings: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      basic_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gold_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      no_of_gems: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      purity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Product",
      paranoid: true,
    }
  );
  return Product;
};
