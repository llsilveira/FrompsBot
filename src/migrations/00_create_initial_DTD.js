"use strict";

const { Sequelize } = require("sequelize");
const { AccountProvider } = require("@frompsbot/common/constants");

async function up({ context: queryInterface }) {
  await queryInterface.createTable("users", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      field: "name",
      type: Sequelize.STRING(32),
      allowNull: false
    },

    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
      allowNull: false
    },

    updatedAt: {
      field: "updated_at",
      type: Sequelize.DATE,
      allowNull: false
    },
  });

  await queryInterface.createTable("user_accounts", {
    provider: {
      field: "provider",
      type: Sequelize.ENUM,
      values: Object.keys(AccountProvider),
      primaryKey: true,
    },

    providerId: {
      field: "provider_id",
      type: Sequelize.STRING(32),
      primaryKey: true,
    },

    userId: {
      field: "user_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
      allowNull: false
    },

    updatedAt: {
      field: "updated_at",
      type: Sequelize.DATE,
      allowNull: false
    },
  });

  await queryInterface.addIndex(
    "user_accounts", ["provider", "user_id"], { unique: true }
  );

  await queryInterface.createTable("games", {
    id: {
      field: "code",
      type: Sequelize.STRING(16),
      primaryKey: true
    },

    name: {
      field: "name",
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true
    },

    shortName: {
      field: "shortname",
      type: Sequelize.STRING(32)
    },

    data: {
      field: "data",
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    }
  });

  await queryInterface.createTable("game_modes", {
    gameId: {
      field: "game_code",
      type: Sequelize.STRING(16),
      primaryKey: true,
      references: {
        model: "games",
        key: "code"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    name: {
      field: "name",
      type: Sequelize.STRING(24),
      primaryKey: true,
    },

    data: {
      field: "data",
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    }
  });
}


module.exports = {
  up
};
