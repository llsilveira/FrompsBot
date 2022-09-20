import path = require("path");

import cls = require("cls-hooked");
import { Dialect, Sequelize, Transaction } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";

import transactional from "../decorators/transactional";
import AppModule from "../app/AppModule";
import Application from "../app/Application";


const namespace: cls.Namespace = cls.createNamespace("fromps-bot-database");
Sequelize.useCLS(namespace);

interface DatabaseConfig {
  database: string,
  username: string,
  password: string,
  host?: string,
  port?: number
}

/**
 * Manages the database connection
 */
export default class Database extends AppModule {
  readonly sequelize: Sequelize;

  constructor(app: Application) {
    super(app);

    const { database, username, password, host, port } =
      app.config.get<DatabaseConfig>("database");
    const options = {
      dialect: "postgres" as Dialect,
      host: host || "localhost",
      port: port || 5432,
      define: {
        // timestamps defaults to false, the opposite of the sequelize default.
        timestamps: false,
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      logging: (msg: unknown) => this.logger.verbose(msg)
    };
    this.sequelize = new Sequelize(database, username, password, options);
  }

  // TODO: create method to test connection with:
  // (async () => await this.sequelize.authenticate())();

  getModel(name: string) {
    return this.sequelize.models[name];
  }

  /**
   * Ensures the callback executes inside a transaction boundary.
   */
  withTransaction<A extends unknown[], R>(
    callback: (...args: A) => PromiseLike<R>, ...args: A
  ) {
    if (this.getTransaction()) { return callback(...args); }
    return this.sequelize.transaction(() => callback(...args));
  }

  /**
   * Returns the stored transaction, if a transaction boundary is active.
   */
  getTransaction() {
    return namespace.get("transaction") as Transaction | undefined;
  }

  @transactional()
  async migrate(version: string) {
    const sequelize = this.sequelize;
    const migrationsPath = path.resolve(
      this.app.applicationRoot, "app/core/migrations");

    const umzug = new Umzug({
      migrations: { glob: migrationsPath + "/*.js" },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: {
        info: (obj) => this.logger.info("Database migration event", obj),
        warn: (obj) => this.logger.warn("Database migration event", obj),
        error: (obj) => this.logger.error("Database migration event", obj),
        debug: (obj) => this.logger.debug("Database migration event", obj),
      },
    });

    if (version) {
      await umzug.up({ to: version });
    } else {
      await umzug.up();
    }
  }
}

AppModule.setModuleName(Database, "db");
