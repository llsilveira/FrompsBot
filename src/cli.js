"use strict";

const commander = require("commander");
const awilix = require("awilix");

const registerModules = require("./modules/registerModules");


module.exports = async function cli(args) {
  const program = new commander.Command();

  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY
  });
  registerModules(container);

  program.version(process.env.npm_package_version, "-V, --version",
    "output the current version");

  program
    .command("run", { isDefault: true })
    .description("run all bot services")
    .option("-s, --service", "activate service mode (no console output)")
    .action(() => run(container));

  program
    .command("discord:update")
    .description("update discord slash commands")
    .action(() => discordUpdate(container));

  await program.parseAsync(args);
};

async function run(container) {
  const discord = container.resolve("discord");
  await discord.start();
}

async function discordUpdate(container) {
  const discord = container.resolve("discord");
  await discord.updateCommands();
}

async function wip() {
  console.log("This is a work in progress and the requested operation was not implemented yet.");
  return -1;
}