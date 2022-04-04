"use strict";

require("./setup");

const process = require("process");

const cli = require("./cli");


if (require.main === module) {
  (async () => cli(process.argv))();
}
