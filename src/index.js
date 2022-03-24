"use strict";

require("dotenv").config();
require("./alias");

const process = require("process");

const cli = require("./cli");


if (require.main === module) {
  (async () => cli(process.argv))();
}
