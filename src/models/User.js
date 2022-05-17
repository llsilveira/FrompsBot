"use strict";


const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");

module.exports = class User extends BaseModel {
  static init(sequelize) {
    return super.init(sequelize, "users", {
      id: {
        field: "id",
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        field: "name",
        type: DataTypes.STRING(32),
        allowNull: false
      },

      data: {
        field: "data",
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
      }
    }, {
      timestamps: true,
    });
  }
};
