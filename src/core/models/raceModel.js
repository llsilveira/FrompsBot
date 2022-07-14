"use strict";

const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../../app");

const { RaceStatus } = require("../constants");


module.exports = function raceModel(db, userModel, gameModel, raceGroupModel) {

  class Race extends AppModelWithData {
    static init(sequelize) {

      const model = super.init(sequelize, "races", {
        id: {
          field: "id",
          type: DataTypes.INTEGER,
          autoIncrement: true,
          autoIncrementIdentity: true,
          primaryKey: true
        },

        creatorId: {
          field: "creator_id",
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: userModel,
            key: "id"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },

        gameId: {
          field: "game_id",
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: gameModel,
            key: "id"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },

        gameModeId: {
          field: "gamemode_id",
          type: DataTypes.INTEGER,
          allowNull: false
          // FK constraint created on migration since sequelize does not have
          // a way to declare associations with composite keys inside the  model
          // definition.
        },

        status: {
          field: "status",
          type: DataTypes.ENUM,
          values: Object.keys(RaceStatus),
          allowNull: false,
        },

        registrationDeadline: {
          field: "registration_deadline",
          type: DataTypes.DATE
        },

        raceGroupId: {
          field: "racegroup_id",
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: raceGroupModel,
            key: "id"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        }
      }, {
        timestamps: true
      });

      gameModel.hasMany(Race, {
        as: "races",
        foreignKey: { name: "gameId" }
      });

      Race.belongsTo(gameModel, {
        as: "game",
        foreignKey: { name: "gameId" }
      });

      Race.belongsTo(userModel, {
        as: "creator",
        foreignKey: { name: "creatorId" }
      });

      raceGroupModel.hasMany(Race, {
        as: "races",
        foreignKey: { name: "raceGroupId" }
      });

      return model;
    }
  }

  db.registerModel(Race);
  return Race;
};
