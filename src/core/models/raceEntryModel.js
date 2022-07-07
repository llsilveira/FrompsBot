"use strict";

const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../../app");

const { RaceEntryStatus } = require("../../constants");


module.exports = function raceEntryModel(db, userModel, raceModel) {

  class RaceEntry extends AppModelWithData {
    static init(sequelize) {

      const model = super.init(sequelize, "race_entries", {
        raceId: {
          field: "race_id",
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: raceModel,
            key: "id"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },

        playerId: {
          field: "player_id",
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: userModel,
            key: "id"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },

        status: {
          field: "status",
          type: DataTypes.ENUM,
          values: Object.keys(RaceEntryStatus),
          allowNull: false,
        },

        finishTime: {
          field: "finish_time",
          type: DataTypes.TIME
        }
      }, {
        timestamps: true
      });

      raceModel.hasMany(RaceEntry, {
        as: "entries",
        foreignKey: { name: "raceId" }
      });

      RaceEntry.belongsTo(raceModel, {
        as: "race",
        foreignKey: { name: "raceId" }
      });

      userModel.hasMany(RaceEntry, {
        as: "entries",
        foreignKey: { name: "playerId" }
      });

      RaceEntry.belongsTo(userModel, {
        as: "player",
        foreignKey: { name: "playerId" }
      });

      return model;
    }
  }

  db.registerModel(RaceEntry);
  return RaceEntry;
};
