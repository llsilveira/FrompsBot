"use strict";

const commander = require("commander");

const { Application } = require("@fromps-bot/application");
const { loadConfig } = require("@fromps-bot/common/helpers");
const modules = require("./modules");

const app = new Application(loadConfig(), modules);

module.exports = async function cli(args) {
  const program = new commander.Command();

  program.version(process.env.npm_package_version, "-V, --version",
    "output the current version");

  program
    .command("run", { isDefault: true })
    .description("run all bot services")
    .option("-s, --service", "activate service mode (no console output)")
    .action(run);

  program
    .command("discord:update")
    .description("update discord slash commands")
    .action(discordUpdate);

  await program.parseAsync(args);
};

async function run() {
  const { discord } = app.loadModules(["discord"]);
  await discord.start();
}

async function discordUpdate() {
  const { discord } = app.loadModules(["discord"]);
  await discord.updateCommands();
}

async function wip() {
  console.log("This is a work in progress and the requested operation was not implemented yet.");
  return -1;
}