"use strict";

const { DataTypes } = require("sequelize");

const { AppModel } = require("../app");

module.exports = function gameModeModel(db, gameModel) {

  class GameMode extends AppModel {
    static init(sequelize) {
      gameModel.init(sequelize);
      const model = super.init(sequelize, "game_modes", {
        gameCode: {
          field: "game_code",
          type: DataTypes.STRING(16),
          primaryKey: true,
          references: {
            model: gameModel,
            key: "code"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },

        name: {
          field: "name",
          type: DataTypes.STRING(24),
          primaryKey: true,
        },

        data: {
          field: "data",
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {}
        }
      }, {
        // We store gamemode names with case to be used later, but they
        // must be unique per game not considering the case.
        indexes: [{
          name: "game_modes_unique_game_code_upper_name",
          unique: true,
          fields: [
            "gameCode", sequelize.fn("upper", sequelize.col("name"))
          ]
        }]
      });

      gameModel.hasMany(GameMode, {
        as: "modes",
        foreignKey: { name: "gameCode" }
      });

      GameMode.belongsTo(gameModel, {
        as: "game",
        foreignKey: { name: "gameCode" }
      });

      return model;
    }
  }

  db.registerModel(GameMode);
  return GameMode;
};
