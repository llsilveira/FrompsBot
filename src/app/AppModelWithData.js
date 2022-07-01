"use strict";

const { DataTypes } = require("sequelize");

const AppModel = require("./AppModel");
const { structuredClone } = require("../helpers");

module.exports = class AppModelWithData extends AppModel {
  getData(key, defaultValue) {
    const data = this.data[key];
    if (typeof data === "undefined") {
      return defaultValue;
    }
    return structuredClone(data);
  }

  setData(key, value) {
    let changed = false;

    if (typeof value !== "undefined") {
      this.data[key] = value;
      changed = true;
    } else if (typeof this.data[key] !== "undefined") {
      delete this.data[key];
      changed = true;
    }

    if (changed) {
      this.changed("data", true);
    }
  }

  static init(sequelize, tableName, fields, opts = {}) {

    fields.data = {
      field: "data",
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    };

    return super.init(sequelize, tableName, fields, opts);
  }
};
