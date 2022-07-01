"use strict";


const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../app");

module.exports = function userModel(db) {

  class User extends AppModelWithData {
    static init(sequelize) {
      return super.init(sequelize, "users", {
        id: {
          field: "id",
          type: DataTypes.INTEGER,
          autoIncrement: true,
          autoIncrementIdentity: true,
          primaryKey: true
        },

        name: {
          field: "name",
          type: DataTypes.STRING(32),
          allowNull: false
        }
      }, {
        timestamps: true,
      });
    }
  }

  db.registerModel(User);
  return User;
};
