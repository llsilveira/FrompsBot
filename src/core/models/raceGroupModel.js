"use strict";

const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../../app");


module.exports = function raceGroupModel(db) {

  class RaceGroup extends AppModelWithData {
    static init(sequelize) {

      const model = super.init(sequelize, "race_groups", {
        name: {
          field: "name",
          type: DataTypes.STRING(20),
          primaryKey: true,
        },

        parentName: {
          field: "parent_name",
          type: DataTypes.STRING(20),
          references: {
            model: RaceGroup,
            key: "name"
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE"
        }
      });

      RaceGroup.hasMany(RaceGroup, {
        as: "children",
        foreignKey: { name: "parentName" }
      });

      RaceGroup.belongsTo(RaceGroup, {
        as: "parent",
        foreignKey: { name: "parentName" }
      });

      return model;
    }
  }

  db.registerModel(RaceGroup);
  return RaceGroup;
};