"use strict";

const { DataTypes } = require("sequelize");

const AppModel = require("./AppModel");
const { structuredClone } = require("../helpers");

module.exports = class AppModelWithData extends AppModel {
  static async loadDataFor(instance) {
    await instance.reload({ attributes: ["data"] });
  }

  async getData(key, defaultValue) {
    if (typeof this.data === typeof undefined) {
      await this.constructor.loadDataFor(this);
    }
    const data = this.data;

    if (typeof data[key] === typeof undefined) {
      return defaultValue;
    }
    return structuredClone(data[key]);
  }

  async setData(key, value) {
    if (typeof this.data === typeof undefined) {
      await this.constructor.loadDataFor(this);
    }
    const data = this.data;

    let changed = false;
    if (typeof value !== typeof undefined) {
      data[key] = value;
      changed = true;
    } else if (typeof data[key] !== typeof undefined) {
      delete data[key];
      changed = true;
    }

    if (changed) {
      this.changed("data", true);
      await this.save({ fields: ["data"] });
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
