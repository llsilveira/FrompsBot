"use strict";

const path = require("path");

const cls = require("cls-hooked");
const { Sequelize } = require("sequelize");

const namespace = cls.createNamespace("fromps-bot-database");
Sequelize.useCLS(namespace);

/**
 * Manages the database connection
 */
class Database {
  constructor(app, config) {
    this.#namespace = namespace;

    this.#app = app;
    this.#logger = this.#app.getLogger("Database");

    const { database, username, password, host, port } = config;
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

  #registerModels() {
    const models = require("./models");

    for (const modelName in models) {
      this.registerModel(models[modelName]);
    }
  }

  #app;
  #logger;
  #namespace;
  #sequelize;
}


module.exports = Database;
