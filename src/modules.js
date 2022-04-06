"use strict";

const { loadConfig } = require("@fromps-bot/common/helpers");

module.exports = {
  discord: {
    require: "@fromps-bot/discord/Discord",
    config: loadConfig("discord")
  }
};
