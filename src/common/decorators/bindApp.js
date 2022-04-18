"use strict";

const { getBoundApp } = require("@frompsbot/common/symbols");

module.exports = function bindApp(getAppCallback = (obj) => obj.app) {
  return function bindApp_decorator(target) {
    Object.defineProperty(target.prototype, getBoundApp, {
      value: function() {
        return getAppCallback(this);
      }
    });
  };
};
