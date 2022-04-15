"use strict";

const { Sequelize } = require("sequelize");
const { UserStatus, AccountProvider } = require("@frompsbot/common/types");

async function up({ context: queryInterface }) {
  await queryInterface.createTable("users", {
    id: {
      field: "id", type: Sequelize.INTEGER, autoIncrement: true,
      primaryKey: true
    },
    name: { field: "name", type: Sequelize.STRING(32), allowNull: false },
    status: {
      field: "status", type: Sequelize.ENUM, values: UserStatus.names(),
      defaultValue: UserStatus.ACTIVE.name, allowNull: false,
    },
    createdAt: {
      field: "created_at", type: Sequelize.DATE, allowNull: false
    },
    updatedAt: {
      field: "updated_at", type: Sequelize.DATE, allowNull: false
    },
  });

  await queryInterface.createTable("user_accounts", {
    provider: {
      field: "provider", type: Sequelize.ENUM,
      values: AccountProvider.names(), primaryKey: true,
    },
    providerId: {
      field: "provider_id", type: Sequelize.STRING(32), primaryKey: true,
    },
    userId: {
      field: "user__id", type: Sequelize.INTEGER, allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "RESTRICT", onUpdate: "CASCADE"
    },
    createdAt: {
      field: "created_at", type: Sequelize.DATE, allowNull: false
    },
    updatedAt: {
      field: "updated_at", type: Sequelize.DATE, allowNull: false
    },
  });

  await queryInterface.addIndex(
    "user_accounts", ["provider", "user__id"], { unique: true }
  );
}


module.exports = {
  up
};
