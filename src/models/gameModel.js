"use strict";

const { DataTypes } = require("sequelize");

const { AppModel } = require("../app");

module.exports = function gameModel(db) {

  class Game extends AppModel {
    static init(sequelize) {
      return super.init(sequelize, "games", {
        code: {
          field: "code",
          type: DataTypes.STRING(16),
          primaryKey: true,
          set(value) {
            this.setDataValue("code", value.toUpperCase());
          }
        },

        name: {
          field: "name",
          type: DataTypes.STRING(64),
          allowNull: false,
          unique: true
        },

        shortName: {
          field: "short_name",
          type: DataTypes.STRING(32),
          get() {
            const raw = this.getDataValue("short_name");
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
      }, {
        indexes: [{
          name: "games_unique_upper_code",
          unique: true,
          fields: [sequelize.fn("upper", sequelize.col("code"))]
        }]
      });
    }
  }

  db.registerModel(Game);
  return Game;
};
