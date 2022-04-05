"use strict";

const pathLoad = require("./pathLoad");

const modules = pathLoad(module.path, { ignoreList: ["pathLoad.js"] });

module.exports = {
  pathLoad,
  ...modules
};

