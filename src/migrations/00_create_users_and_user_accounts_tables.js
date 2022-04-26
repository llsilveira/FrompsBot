"use strict";

const { Sequelize } = require("sequelize");
const {
  UserStatus,
  AccountProvider,
  RaceCategory,
  RaceType,
  RaceStatus
} = require("@frompsbot/common/values");

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

    status: {
      field: "status",
      type: Sequelize.ENUM,
      values: Object.keys(UserStatus),
      defaultValue: UserStatus.ACTIVE,
      allowNull: false,
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
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      field: "name",
      type: Sequelize.STRING(64),
      allowNull: false
    },

    shortName: {
      field: "shortname",
      type: Sequelize.STRING(32)
    },

    description: {
      field: "description",
      type: Sequelize.TEXT
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

  await queryInterface.createTable("game_modes", {
    gameId: {
      field: "game_id",
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: "games",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    name: {
      field: "name",
      type: Sequelize.STRING(32),
      primaryKey: true,
    },

    description: {
      field: "description",
      type: Sequelize.TEXT
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

  await queryInterface.createTable("races", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    gameId: {
      field: "game_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "games",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    gameModeName: {
      field: "game_mode_name",
      type: Sequelize.STRING(32)
    },

    creatorId: {
      field: "creator_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    type: {
      field: "type",
      type: Sequelize.ENUM,
      values: Object.keys(RaceType),
      allowNull: false,
    },

    category: {
      field: "category",
      type: Sequelize.ENUM,
      values: Object.keys(RaceCategory),
      allowNull: false,
    },

    status: {
      field: "status",
      type: Sequelize.ENUM,
      values: Object.keys(RaceStatus),
      allowNull: false,
    },

    submissionDeadline: {
      field: "submission_deadline",
      type: Sequelize.DATE
    },

    raceData: {
      field: "racedata",
      type: Sequelize.JSONB,
      defaultValue: {}
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
    }
  });

  await queryInterface.addConstraint("races", {
    type: "foreign key",
    fields: ["game_id", "game_mode_name"],
    references: {
      table: "game_modes",
      fields: ["game_id", "name"]
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  });
}


module.exports = {
  up
};
