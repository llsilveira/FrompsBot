"use strict";

const process = require("process");
const path = require("path");

module.exports = function loadConfig(
  filename = "config", {
    instancePath,
    configPath,
    configOverride = {}
  } = {}
) {
  const _instancePath =
    instancePath ||
    process.env.INSTANCE_PATH ||
    process.cwd();

  const _configPath =
    configPath ||
    process.env.CONFIG_PATH ||
    path.resolve(_instancePath, "config");

  const configFile = path.resolve(_configPath, filename);

  const config = require(configFile);
  Object.assign(config, configOverride);

  return config;
};
