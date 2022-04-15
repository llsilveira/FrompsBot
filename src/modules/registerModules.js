"use strict";

const awilix = require("awilix");
const { loadConfig } = require("@frompsbot/common/helpers");

const config = loadConfig();

module.exports = function registerModules(container) {
  container.register({
    logger: awilix.asClass(
      require("./core/Logger"), {
        lifetime: awilix.Lifetime.SINGLETON,
        injector: () => ({
          config: config.logging
        })
      }
    ),

    context: awilix.asClass(
      require("./core/Context"), {
        lifetime: awilix.Lifetime.SINGLETON
      }
    ),

    database: awilix.asClass(
      require("./core/database/Database"), {
        lifetime: awilix.Lifetime.SINGLETON,
        injector: () => ({
          config: config.database
        })
      }
    ),

    discord: awilix.asClass(
      require("./discord/Discord"), {
        lifetime: awilix.Lifetime.SINGLETON,
        injector: () => ({
          config: config.discord
        })
      }
    )
  });
};
