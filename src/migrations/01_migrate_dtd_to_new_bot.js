"use strict";

const { Sequelize } = require("sequelize");
const { AccountProvider } = require("../constants");

async function up({ context: queryInterface }) {
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
  // end user_accounts table

  // user_accounts unique (provider, providerId) index
  await queryInterface.addIndex(
    "user_accounts", ["provider", "user_id"], { unique: true }
  );

  // games table
  await queryInterface.createTable("games", {
    code: {
      field: "code",
      type: Sequelize.STRING(24),
      primaryKey: true
    },

    name: {
      field: "name",
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true
    },

    shortname: {
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
  // end games table

  // gamemodes table
  await queryInterface.createTable("gamemodes", {
    gameCode: {
      field: "game_code",
      type: Sequelize.STRING(24),
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
  // end gamemodes table


  /* ********************************************
  *          Table and data migration           *
  ******************************************** */

  /* Retrieve players from the old database schema */
  const players = await queryInterface.sequelize.query(
    "SELECT * FROM players",
    { type: Sequelize.QueryTypes.SELECT }
  );


  /* Map players to users and user_accounts */

  // ids 1-1000 will be reserved for eventual system users
  let idSeq = 1000;

  const playersMap = new Map();
  const now = new Date();
  for (const player of players) {
    ++idSeq;

    // users data
    const newUser = {
      id: idSeq,
      name: player.name,
      data: JSON.stringify({
        leaderboard: player.leaderboard_data || {}
      }),
      created_at: now,
      updated_at: now
    };

    // user_accounts data
    const newAccount = {
      provider: "DISCORD",
      provider_id: player.discord_id,
      user_id: idSeq,
      created_at: now,
      updated_at: now
    };

    playersMap.set(player.discord_id, {
      player: player,
      user: newUser,
      account: newAccount,
    });
  }

  if (players.length > 0) {
    // Insert into users
    await queryInterface.bulkInsert("users", Array.from(playersMap.values()).map(
      value => value.user
    ));

    // Insert into user_accounts
    await queryInterface.bulkInsert("user_accounts",
      Array.from(playersMap.values()).map(value => value.account)
    );
  }

  // Set users id sequence to the last id used
  await queryInterface.sequelize.query(
    `SELECT setval('users_id_seq', ${idSeq})`
  );


  /* Prepare existing games */
  const games = [{
    code: "ALTTPR",
    name: "The Legend of Zelda: A Link to The Past Randomizer",
    shortname: "A Link to The Past Randomizer",
    data: JSON.stringify({
      color: 0x188020,
    })
  }, {
    code: "OOTR",
    name: "The Legend of Zelda: Ocarina of Time Randomizer",
    shortname: "Ocarina of Time Randomizer",
    data: JSON.stringify({
      color: 0x5F1412,
    })
  }, {
    code: "MMR",
    name: "The Legend of Zelda: Majora's Mask Randomizer",
    shortname: "Majora's Mask Randomizer",
    data: JSON.stringify({
      color: 0xae27cf,
    })
  }, {
    code: "TMCR",
    name: "The Legend of Zelda: The Minish Cap Randomizer",
    shortname: "The Minish Cap Randomizer",
    data: JSON.stringify({
      color: 0x73C636,
    })
  }, {
    code: "PKMN_CRYSTAL",
    name: "Pokemon Crystal Randomizer",
    data: JSON.stringify({
      color: 0xFFCB06,
    })
  }, {
    code: "SMR",
    name: "Super Metroid Randomizer",
    data: JSON.stringify({
      color: 0x127C6A,
    })
  }, {
    code: "HKR",
    name: "Hollow Knight Randomizer",
    data: JSON.stringify({
      color: 0xCCCCCC,
    })
  }];

  /* Creating legacy mode for existing races */
  const gamemodes = games.map(game => ({
    game_code: game.code,
    name: "RBR_SEMANAL_LEGADO",
    data: JSON.stringify({
      description: "Modo de jogo padrão para as antigas corridas semanais da Randomizer Brasil."
    })
  }));

  /* Insert games and gamemodes */
  await queryInterface.bulkInsert("games", games);
  await queryInterface.bulkInsert("gamemodes", gamemodes);
}


module.exports = {
  up
};
