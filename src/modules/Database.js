"use strict";

const path = require("path");

const cls = require("cls-hooked");
const { Sequelize } = require("sequelize");

const { transactional } = require("../decorators");
const { AppModule } = require("../app");

const namespace = cls.createNamespace("fromps-bot-database");
Sequelize.useCLS(namespace);

/**
 * Manages the database connection
 */
class Database extends AppModule {
  constructor(app) {
    super(app);

    const { database, username, password, host, port } = app.config.get("database");
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
      logging: (msg) => this.logger.verbose(msg)
    };
    this.#sequelize = new Sequelize(database, username, password, options);
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
    return namespace.get("transaction");
  }

  @transactional()
  async migrate() {
    const sequelize = this.#sequelize;
    const migrationsPath = path.resolve(this.app.applicationRoot, "migrations");

    const { Umzug, SequelizeStorage } = require("umzug");
    const umzug = new Umzug({
      migrations: { glob: migrationsPath + "/*.js" },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });

    await umzug.up();
  }

  #sequelize;
}

AppModule.setModuleName(Database, "db");
module.exports = Database;
