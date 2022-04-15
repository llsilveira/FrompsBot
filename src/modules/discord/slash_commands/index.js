"use strict";

const pathLoad = require("@fromps/common/pathLoad");

module.exports = pathLoad(module.path, { ignore: ["BaseCommand.js"] });
