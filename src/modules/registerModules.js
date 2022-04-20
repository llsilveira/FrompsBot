"use strict";

const awilix = require("awilix");

module.exports = function registerModules(container) {
  container.register({
    discord: awilix.asClass(
      require("./discord/Discord"), {
        lifetime: awilix.Lifetime.SINGLETON
      }
    )
  });
};
