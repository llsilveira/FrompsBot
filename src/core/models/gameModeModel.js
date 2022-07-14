"use strict";

const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../../app");

module.exports = function gameModeModel(db, gameModel) {

  class GameMode extends AppModelWithData {
    static init(sequelize) {
      gameModel.init(sequelize);
      const model = super.init(sequelize, "game_modes", {
        gameId: {
          field: "game_id",
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: gameModel,
            key: "id"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },

        id: {
          field: "id",
          type: DataTypes.INTEGER,
          autoIncrement: true,
          autoIncrementIdentity: true,
          primaryKey: true
        },

        name: {
          field: "name",
          type: DataTypes.STRING(24),
          allowNull: false
        },

        description: {
          field: "description",
          type: DataTypes.STRING(80),
          allowNull: false
        }
      }, {
        // We store gamemode names with case to be used later, but they
        // must be unique per game not considering the case.
        indexes: [{
          name: "game_modes_unique_game_id_upper_name",
          unique: true,
          fields: [
            "gameId", sequelize.fn("upper", sequelize.col("name"))
          ]
        }]
      });

      gameModel.hasMany(GameMode, {
        as: "modes",
        foreignKey: { name: "gameId" }
      });

      GameMode.belongsTo(gameModel, {
        as: "game",
        foreignKey: { name: "gameId" }
      });

      return model;
    }
  }

  db.registerModel(GameMode);
  return GameMode;
};
