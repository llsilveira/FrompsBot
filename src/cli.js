"use strict";

const commander = require("commander");


module.exports = async function cli(args) {
  const program = new commander.Command();

  program.version(process.env.npm_package_version, "-V, --version",
    "output the current version");

  program
    .command("run", { isDefault: true })
    .description("run all bot services")
    .option("-s, --service", "activate service mode (no console output)")
    .action(wip);

  await program.parseAsync(args);
};

async function wip() {
  console.log("This is a work in progress and the requested operation was not implemented yet.");
  return -1;
}