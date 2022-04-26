"use strict";

const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");
const Game = require("./Game");

module.exports = class GameMode extends BaseModel {
  static init(sequelize) {
    Game.init(sequelize);
    const model = super.init(sequelize, "game_modes", {
      gameId: {
        field: "game_id",
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: Game,
          key: "id"
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },

      name: {
        field: "name",
        type: DataTypes.STRING(32),
        primaryKey: true,
      },

      description: {
        field: "description",
        type: DataTypes.TEXT
      },
    });

    Game.hasMany(GameMode, {
      as: "modes",
      foreignKey: { name: "gameId" }
    });

    GameMode.belongsTo(Game, {
      as: "game",
      foreignKey: { name: "gameId" }
    });

    return model;
  }
};
