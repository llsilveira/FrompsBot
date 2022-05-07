"use strict";

const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");

module.exports = class Game extends BaseModel {
  static init(sequelize) {
    return super.init(sequelize, "games", {
      code: {
        field: "code",
        type: DataTypes.STRING(16),
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        field: "name",
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },

      shortName: {
        field: "shortname",
        type: DataTypes.STRING(32)
      },

      data: {
        field: "data",
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
      }
    });
  }
};
