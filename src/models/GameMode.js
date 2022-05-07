"use strict";

const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");
const Game = require("./Game");

module.exports = class GameMode extends BaseModel {
  static init(sequelize) {
    Game.init(sequelize);
    const model = super.init(sequelize, "game_modes", {
      gameCode: {
        field: "game_code",
        type: DataTypes.STRING(16),
        primaryKey: true,
        references: {
          model: Game,
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
    });

    Game.hasMany(GameMode, {
      as: "modes",
      foreignKey: { name: "gameCode" }
    });

    GameMode.belongsTo(Game, {
      as: "game",
      foreignKey: { name: "gameCode" }
    });

    return model;
  }
};
