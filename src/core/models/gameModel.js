"use strict";

const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../../app");

module.exports = function gameModel(db) {

  class Game extends AppModelWithData {
    static init(sequelize) {
      return super.init(sequelize, "games", {
        id: {
          field: "id",
          type: DataTypes.INTEGER,
          autoIncrement: true,
          autoIncrementIdentity: true,
          primaryKey: true
        },

        code: {
          field: "code",
          type: DataTypes.STRING(24),
          allowNull:false,
          // unique constraint below
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
            const raw = this.getDataValue("shortName");
            if (!raw) { return this.name; }
            return raw;
          }
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
