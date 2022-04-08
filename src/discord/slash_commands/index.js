"use strict";

const pathLoad = require("@fromps-bot/common/pathLoad");

module.exports = pathLoad(module.path, { ignore: ["BaseCommand.js"] });
