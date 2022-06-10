"use strict";


const { DataTypes } = require("sequelize");

const { AppModel } = require("../app");

module.exports = function userModel(db) {

  class User extends AppModel {
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
  }

  db.registerModel(User);
  return User;
};
