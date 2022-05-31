"use strict";

const v8 = require("v8");

module.exports = function structuredClone(obj) {
  return v8.deserialize(v8.serialize(obj));
};
