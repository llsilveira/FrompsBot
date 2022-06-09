"use strict";

const { DataTypes } = require("sequelize");

const { AppModel } = require("../app");

module.exports = function gameModel(db) {

  class Game extends AppModel {
    static init(sequelize) {
      return super.init(sequelize, "games", {
        code: {
          field: "code",
          type: DataTypes.STRING(24),
          autoIncrement: true,
          primaryKey: true
        },

        name: {
          field: "name",
          type: DataTypes.STRING(64),
          allowNull: false,
          unique: true
        },

        shortname: {
          field: "shortname",
          type: DataTypes.STRING(32),
          get() {
            const raw = this.getDataValue("shortname");
            if (!raw) { return this.name; }
            return raw;
          }
        },

        data: {
          field: "data",
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {}
        }
      });
    }
  }

  db.registerModel(Game);
  return Game;
};
