"use strict";

const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../../app");


module.exports = function raceGroupModel(db) {

  class RaceGroup extends AppModelWithData {
    static init(sequelize) {

      const model = super.init(sequelize, "race_groups", {
        id: {
          field: "id",
          type: DataTypes.INTEGER,
          autoIncrement: true,
          autoIncrementIdentity: true,
          primaryKey: true
        },

        parentId: {
          field: "parent_id",
          type: DataTypes.INTEGER,
          references: {
            model: RaceGroup,
            key: "id"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        },

        name: {
          field: "name",
          type: DataTypes.STRING(24),
          allowNull: false,
          unique: true
        },
      });

      RaceGroup.hasMany(RaceGroup, {
        as: "children",
        foreignKey: { name: "parentId" }
      });

      RaceGroup.belongsTo(RaceGroup, {
        as: "parent",
        foreignKey: { name: "parentId" }
      });

      return model;
    }
  }

  db.registerModel(RaceGroup);
  return RaceGroup;
};
