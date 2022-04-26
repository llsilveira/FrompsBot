"use strict";

const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");

const User = require("./User");
const Game = require("./Game");

const { RaceCategory, RaceType, RaceStatus } = require("@frompsbot/common/values");

module.exports = class Race extends BaseModel {
  static init(sequelize) {
    Game.init(sequelize);
    User.init(sequelize);
    const model = super.init(sequelize, "races", {
      id: {
        field: "id",
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      gameId: {
        field: "game_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Game,
          key: "id"
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },

      gameModeName: {
        field: "game_mode_name",
        type: DataTypes.STRING(32)
      },

      creatorId: {
        field: "creator_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: "id"
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },

      type: {
        field: "type",
        type: DataTypes.ENUM,
        values: Object.keys(RaceType),
        allowNull: false,
      },

      category: {
        field: "category",
        type: DataTypes.ENUM,
        values: Object.keys(RaceCategory),
        allowNull: false,
      },

      status: {
        field: "status",
        type: DataTypes.ENUM,
        values: Object.keys(RaceStatus),
        allowNull: false,
      },

      submissionDeadline: {
        field: "submission_deadline",
        type: DataTypes.DATE
      },

      raceData: {
        field: "racedata",
        type: DataTypes.JSONB,
        defaultValue: {}
      }
    }, {
      timestamps: true
    });

    Game.hasMany(Race, {
      as: "races",
      foreignKey: { name: "gameId" }
    });

    Race.belongsTo(Game, {
      as: "game",
      foreignKey: { name: "gameId" }
    });

    Race.belongsTo(User, {
      as: "creator",
      foreignKey: { name: "creatorId" }
    });

    return model;
  }
};
