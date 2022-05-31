"use strict";


const { Model } = require("sequelize");


module.exports = class AppModel extends Model {
  static init(sequelize, tableName, fields, opts = {}) {
    // tableName is mandatory to avoid auto generated table names.
    opts.tableName = tableName;
    return super.init(fields, { ...opts, sequelize });
  }
};
