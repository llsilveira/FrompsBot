"use strict";

const { Sequelize } = require("sequelize");
async function up({ context: queryInterface }) {
  await queryInterface.createTable("players", {
    discordId: {
      field: "discord_id",
      type: Sequelize.BIGINT,
      primaryKey: true
    },

    name: {
      field: "name",
      type: Sequelize.STRING(32),
      allowNull: false
    },

    status: {
      field: "status",
      type: Sequelize.STRING(20),
      allowNull: false
    },

    leaderboardData: {
      field: "leaderboard_data",
      type: Sequelize.JSON,
      defaultValue: {}
    },
  });

  await queryInterface.createTable("leaderboards", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    game: {
      field: "game",
      type: Sequelize.STRING(20),
      allowNull: false
    },

    resultsUrl: {
      field: "results_url",
      type: Sequelize.STRING,
    },

    status: {
      field: "status",
      type: Sequelize.STRING(20),
      allowNull: false
    },

    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
      allowNull: false
    },

    leaderboardData: {
      field: "leaderboard_data",
      type: Sequelize.JSON,
      defaultValue: {}
    },
  });

  await queryInterface.createTable("weeklies", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    game: {
      field: "game",
      type: Sequelize.STRING(20),
      allowNull: false
    },

    status: {
      field: "status",
      type: Sequelize.STRING(20),
      allowNull: false
    },

    seedUrl: {
      field: "seed_url",
      type: Sequelize.STRING,
      allowNull: false
    },

    seedHash: {
      field: "seed_hash",
      type: Sequelize.STRING
    },

    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
      allowNull: false
    },

    submissionEnd: {
      field: "submission_end",
      type: Sequelize.DATE,
      allowNull: false
    },

    leaderboardId: {
      field: "leaderboard_id",
      type: Sequelize.INTEGER,
      references: {
        model: "leaderboards",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
  });


  await queryInterface.createTable("player_entries", {
    weeklyId: {
      field: "weekly_id",
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: "weeklies",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    playerDiscordId: {
      field: "player_discord_id",
      type: Sequelize.BIGINT,
      primaryKey: true,
      references: {
        model: "players",
        key: "discord_id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    status: {
      field: "status",
      type: Sequelize.STRING(20),
      allowNull: false
    },

    finishTime: {
      field: "finish_time",
      type: Sequelize.TIME,
    },

    printUrl: {
      field: "print_url",
      type: Sequelize.STRING,
    },

    vodUrl: {
      field: "vod_url",
      type: Sequelize.STRING,
    },

    comment: {
      field: "comment",
      type: Sequelize.STRING,
    },

    registeredAt: {
      field: "registered_at",
      type: Sequelize.DATE,
      allowNull: false
    },

    timeSubmittedAt: {
      field: "time_submitted_at",
      type: Sequelize.DATE,
    },

    vodSubmittedAt: {
      field: "vod_submitted_at",
      type: Sequelize.DATE,
    },

    leaderboardData: {
      field: "leaderboard_data",
      type: Sequelize.JSON,
      defaultValue: {}
    },
  });

  await queryInterface.createTable("leaderboard_entries", {
    leaderboardId: {
      field: "leaderboard_id",
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: "leaderboards",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    playerDiscordId: {
      field: "player_discord_id",
      type: Sequelize.BIGINT,
      primaryKey: true,
      references: {
        model: "players",
        key: "discord_id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    leaderboardData: {
      field: "leaderboard_data",
      type: Sequelize.JSON,
      defaultValue: {}
    },
  });

}


module.exports = {
  up
};
