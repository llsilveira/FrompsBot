"use strict";

require("dotenv").config();

const path = require("path");
const moduleAlias = require("module-alias");

moduleAlias.addAlias("@fromps-bot", path.resolve(module.path));
