"use strict";


const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");

const { UserStatus } = require("@frompsbot/common/values");


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

      status: {
        field: "status",
        type: DataTypes.ENUM,
        values: Object.keys(UserStatus),
        defaultValue: UserStatus.ACTIVE,
        allowNull: false,
      },
    }, {
      timestamps: true,
    });
  }
};
