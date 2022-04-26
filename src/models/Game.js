"use strict";

const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");

module.exports = class Game extends BaseModel {
  static init(sequelize) {
    return super.init(sequelize, "games", {
      id: {
        field: "id",
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        field: "name",
        type: DataTypes.STRING(64),
        allowNull: false
      },

      shortName: {
        field: "shortname",
        type: DataTypes.STRING(32)
      },

      description: {
        field: "description",
        type: DataTypes.TEXT
      },
    }, {
      timestamps: true,
    });
  }
};
