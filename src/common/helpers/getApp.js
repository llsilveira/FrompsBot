"use strict";

const { getBoundApp } = require("@frompsbot/common/symbols");

module.exports = function getApp(obj) {
  if (typeof obj[getBoundApp] === "function") {
    return obj[getBoundApp]();
  } else if (typeof obj["getApp"] === "function") {
    return obj["getApp"]();
  } else {
    return obj.app;
  }
};
