"use strict";


const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");

const { UserStatus } = require("@frompsbot/common/types");


module.exports = class User extends BaseModel {
  static init(sequelize) {
    return super.init(sequelize, "users", {
      id: {
        field: "id", type: DataTypes.INTEGER, autoIncrement: true,
        primaryKey: true
      },
      name: { field: "name", type: DataTypes.STRING(32), allowNull: false },
      status: {
        field: "status", type: DataTypes.ENUM, values: UserStatus.names(),
        defaultValue: UserStatus.ACTIVE.name, allowNull: false,
      },
    }, {
      timestamps: true,
    });
  }
};
