"use strict";

const process = require("process");
const commander = require("commander");
const Application = require("./Application");

const INSTANCE_PATH = process.env.INSTANCE_PATH || process.cwd();


module.exports = async function cli(args) {
  const program = new commander.Command();

  const app = new Application("FrompsBot", INSTANCE_PATH);

  program.version(process.env.npm_package_version, "-V, --version",
    "output the current version");

  program
    .command("run", { isDefault: true })
    .description("run all bot services")
    .option("-s, --service", "activate service mode (no console output)")
    .action(() => run(app));

  program
    .command("discord:update")
    .description("update discord slash commands")
    .action(() => discordUpdate(app));

  program
    .command("db:migrate")
    .description("update the database to the specified version")
    .argument("[version]", "target version (default: latest)")
    .action(() => dbMigrate(app));

  await program.parseAsync(args);
};

async function run(app) {
  const discord = app.container.resolve("discord");
  await discord.start();
}

async function discordUpdate(app) {
  const discord = app.container.resolve("discord");
  await discord.updateCommands();
}

async function dbMigrate(app) {
  const db = app.container.resolve("db");
  await db.migrate();
}
