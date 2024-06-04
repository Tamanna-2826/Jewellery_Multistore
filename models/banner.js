"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      // associations can be defined here
    }
  }

  Banner.init(
    {
      banner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isAfterStartDate(value) {
            if (value <= this.start_date) {
              throw new Error("End date must be after start date");
            }
          },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Banner",
      paranoid: true,
    }
  );

  return Banner;
};
