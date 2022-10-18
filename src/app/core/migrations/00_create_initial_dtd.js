"use strict";

const { Sequelize } = require("sequelize");

async function up({ context: queryInterface }) {
  const sequelize = queryInterface.sequelize;

  /* ********************************************
  *            New table definitions            *
  ******************************************** */

  // users table
  await queryInterface.createTable("users", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

    name: {
      field: "name",
      type: Sequelize.STRING(32),
      allowNull: false
    },

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
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
    },
  });
  // end users table

  // user_accounts table
  await queryInterface.createTable("user_accounts", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

    provider: {
      field: "provider",
      type: Sequelize.ENUM,
      allowNull: false,
      unique: "provider_identity",
      values: ["DISCORD", "TWITCH"],
    },

    providerId: {
      field: "provider_id",
      allowNull: false,
      unique: "provider_identity",
      type: Sequelize.STRING(32),
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

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
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
    },
  });
  // end user_accounts table

  // user_accounts unique (provider, userId) index
  await queryInterface.addIndex(
    "user_accounts", {
      unique: true,
      fields: ["provider", "user_id"]
    }
  );

  // games table
  await queryInterface.createTable("games", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

    code: {
      field: "code",
      type: Sequelize.STRING(24),
      allowNull:false,
    },

    name: {
      field: "name",
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true
    },

    shortName: {
      field: "short_name",
      type: Sequelize.STRING(32)
    },

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  });
  // end games table

  // games unique upper(code)
  await queryInterface.addIndex(
    "games", {
      name: "games_unique_upper_code",
      unique: true,
      fields: [sequelize.fn("upper", sequelize.col("code"))]
    }
  );

  // game_modes table
  await queryInterface.createTable("game_modes", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
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

    name: {
      field: "name",
      type: Sequelize.STRING(24),
      allowNull: false
    },

    description: {
      field: "description",
      type: Sequelize.STRING(80),
      allowNull: false
    },

    longDescription: {
      field: "long_description",
      type: Sequelize.TEXT,
      defaultValue: ""
    },

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  });
  // end game_modes table

  // game_modes unique (game_code, upper(name))
  await queryInterface.addIndex(
    "game_modes", {
      name: "game_modes_unique_game_id_upper_name",
      unique: true,
      fields: [
        "game_id", sequelize.fn("upper", sequelize.col("name"))
      ]
    }
  );

  // game_modes unique (id, game_id)
  await queryInterface.addIndex(
    "game_modes", {
      unique: true,
      fields: ["id", "game_id"]
    }
  );


  // races table
  await queryInterface.createTable("races", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
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

    gameModeId: {
      field: "gamemode_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "game_modes",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
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
  // end races table

  // in addition to reference gameMode by id, this FK constraint ensures that
  // the gameMode is from the same game pointed by gameId
  await queryInterface.addConstraint("races", {
    type: "foreign key",
    fields: ["game_id", "gamemode_id"],
    references: {
      table: "game_modes",
      fields: ["game_id", "id"]
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
  });

  // race_entries table
  await queryInterface.createTable("race_entries", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

    raceId: {
      field: "race_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: "race_player",
      references: {
        model: "races",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    playerId: {
      field: "player_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: "race_player",
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    status: {
      field: "status",
      type: Sequelize.ENUM,
      values: ["REGISTERED", "TIME_SUBMITTED", "DONE", "DNF"],
      allowNull: false,
    },

    finishTime: {
      field: "finish_time",
      type: Sequelize.TIME
    },

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
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
  // end race_entries table


  // Add FrompsBot System user
  await sequelize.query(
    "INSERT INTO users (id, name, data, created_at, updated_at) " +
    "VALUES (1, 'FrompsBot', '{ \"bot\": { \"isAdmin\": true } }', current_timestamp, current_timestamp)"
  );

  // First 1000 ids are reserved
  await sequelize.query("SELECT setval('users_id_seq', 1000)");
}


module.exports = {
  up
};
