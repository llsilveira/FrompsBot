"use strict";

const { pathLoad } = require("@fromps-bot/common/helpers");

module.exports = pathLoad(module.path, { ignoreList: ["BaseCommand.js"] });
