"use strict";

const path = require("path");

const cls = require("cls-hooked");
const { Sequelize } = require("sequelize");

const { transactional } = require("@frompsbot/common/decorators");

const namespace = cls.createNamespace("fromps-bot-database");
Sequelize.useCLS(namespace);

/**
 * Manages the database connection
 */
module.exports = class Database {
  constructor({ app }) {
    this.#app = app;
    this.#config = this.#app.config.get("database");
    this.#logger = this.#app.logger.getLogger(this);

    this.#namespace = namespace;

    const { database, username, password, host, port } = this.#config;
    const options = {
      dialect: "postgres",
      host: host || "localhost",
      port: port || 5432,
      define: {
        // timestamps defaults to false, the opposite of the sequelize default.
        timestamps: false,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      logging: (msg) => this.#logger.info(msg)
    };
    this.#sequelize = new Sequelize(database, username, password, options);

    this.#registerModels();
  }

  get app() {
    return this.#app;
  }

  // TODO: create method to test connection with:
  // (async () => await this.sequelize.authenticate())();

  registerModel(model) {
    return model.init(this.#sequelize);
  }

  getModel(name) {
    return this.#sequelize.models[name];
  }

  /**
   * Ensures the callback executes inside a transaction boundary.
   */
  withTransaction(callback, ...args) {
    if (this.getTransaction()) { return callback(...args); }
    return this.#sequelize.transaction(() => callback(...args));
  }

  /**
   * Returns the stored transaction, if a transaction boundary is active.
   */
  getTransaction() {
    return this.#namespace.get("transaction");
  }

  @transactional()
  async migrate() {
    const sequelize = this.#sequelize;
    const migrationsPath = path.resolve(module.path, "migrations");

    const { Umzug, SequelizeStorage } = require("umzug");
    const umzug = new Umzug({
      migrations: { glob: migrationsPath + "/*.js" },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });

    await umzug.up();
  }


  #registerModels() {
    const models = require("./models");

    for (const modelName in models) {
      this.registerModel(models[modelName]);
    }
  }

  #app;
  #config;
  #logger;
  #namespace;
  #sequelize;
};
