import commander = require("commander");
import Application from "./app/Application";
import AccountProvider from "./constants/AccountProvider";
import runAsBot from "./helpers/runAsBot";


const INSTANCE_PATH = process.env.INSTANCE_PATH || process.cwd();

export default async function cli(args: string[]) {
  const program = new commander.Command();

  const app = new Application("FrompsBot", INSTANCE_PATH);

  program.version(
    process.env.npm_package_version || "unknown version",
    "-V, --version",
    "output the current version"
  );

  program
    .command("run", { isDefault: true })
    .description("run all bot services")
    .option("-s, --service", "activate service mode (no console output)")
    .action(() => run(app));

  program
    .command("bot:addAdmin")
    .description("add the bot admin role to the user")
    .argument("<userDiscordId>", "id of the user on discord")
    .action((userDiscordId: string) => botAddAdmin(app, userDiscordId));

  program
    .command("discord:update")
    .description("update discord slash commands")
    .action(() => discordUpdate(app));

  program
    .command("db:migrate")
    .description("update the database to the specified version")
    .argument("[version]", "target version (default: latest)")
    .action((version: string) => dbMigrate(app, version));

  await program.parseAsync(args);
}

async function run(app: Application) {
  await app.discord.start();
}

async function botAddAdmin(app: Application, userDiscordId: string) {
  const user = await app.services.user.getFromProvider(
    AccountProvider.DISCORD, userDiscordId
  );

  if (!user) {
    console.log("Usuário não encontrado!");
  } else {
    await runAsBot(app, async () => await app.services.bot.addAdmin(user));
    console.log(`${user.name} foi adicionado como admin deste bot.`);
  }
}

async function discordUpdate(app: Application) {
  await app.discord.updateCommands();
  console.log("Comandos atualizados!");
}

async function dbMigrate(app: Application, version: string) {
  await app.db.migrate(version);
  console.log("Migração concluída!");
}
