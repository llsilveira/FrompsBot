"use strict";

// TODO: CHANGE GAMEMODE TO HAVE A SINGLE PRIMARY KEY, CREATE A UNIQUE INDEX
// WITH (id, gameId) AND SET FK CONSTRAINT ON RACE FOR GAMEMODE TO THIS INDEX.
// USERACCOUNT TOO

const { Sequelize } = require("sequelize");
const { default: AccountProvider } = require("../core/constants/AccountProvider");
const { default: RaceStatus } = require("../core/constants/RaceStatus");
const { default: RaceEntryStatus } = require("../core/constants/RaceEntryStatus");

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
      values: Object.keys(AccountProvider),
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


  // race_groups table
  await queryInterface.createTable("race_groups", {
    id: {
      field: "id",
      type: Sequelize.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

    parentId: {
      field: "parent_id",
      type: Sequelize.INTEGER,
      references: {
        model: "race_groups",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    name: {
      field: "name",
      type: Sequelize.STRING(24),
      allowNull: false,
      unique: true
    },

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    },
  });
  // end race_groups table

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

    status: {
      field: "status",
      type: Sequelize.ENUM,
      values: Object.keys(RaceStatus),
      allowNull: false,
    },

    registrationDeadline: {
      field: "registration_deadline",
      type: Sequelize.DATE
    },

    data: {
      field: "data",
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {}
    },

    raceGroupId: {
      field: "racegroup_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "race_groups",
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
      values: Object.keys(RaceEntryStatus),
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


  /* ********************************************
  *          Table and data migration           *
  ******************************************** */
  const now = new Date();

  /* Retrieve players from the old database schema */
  const players = await sequelize.query(
    "SELECT * FROM players",
    { type: Sequelize.QueryTypes.SELECT }
  );


  /* Map players to users and user_accounts */

  // ids 1-1000 will be reserved for eventual system users
  let userIdSeq = 1000;

  let accountIdSeq = 0;
  const playersMap = new Map();
  for (const player of players) {
    ++userIdSeq;
    ++accountIdSeq;

    // users data
    const newUser = {
      id: userIdSeq,
      name: player.name,
      data: JSON.stringify({
        leaderboard: player.leaderboard_data || {}
      }),
      created_at: now,
      updated_at: now
    };

    // user_accounts data
    const newAccount = {
      id: accountIdSeq,
      provider: "DISCORD",
      provider_id: player.discord_id,
      user_id: userIdSeq,
      created_at: now,
      updated_at: now
    };

    playersMap.set(player.discord_id, {
      id: userIdSeq,
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

  // Add FrompsBot System user
  await sequelize.query(
    "INSERT INTO users (id, name, data, created_at, updated_at) " +
    "VALUES (1, 'FrompsBot', '{ \"bot\": { \"isAdmin\": true } }', current_timestamp, current_timestamp)"
  );

  // Set users id sequence to the last id used
  await sequelize.query(
    `SELECT setval('users_id_seq', ${userIdSeq})`
  );

  // Set user_accounts id sequence to the last id used
  await sequelize.query(
    `SELECT setval('user_accounts_id_seq', ${accountIdSeq})`
  );


  /* Prepare existing games */
  const gamesList = [{
    id: 1,
    code: "ALTTPR",
    name: "The Legend of Zelda: A Link to The Past Randomizer",
    short_name: "A Link to The Past Randomizer",
    data: JSON.stringify({
      color: 0x188020,
    })
  }, {
    id: 2,
    code: "OOTR",
    name: "The Legend of Zelda: Ocarina of Time Randomizer",
    short_name: "Ocarina of Time Randomizer",
    data: JSON.stringify({
      color: 0x5F1412,
    })
  }, {
    id: 3,
    code: "MMR",
    name: "The Legend of Zelda: Majora's Mask Randomizer",
    short_name: "Majora's Mask Randomizer",
    data: JSON.stringify({
      color: 0xae27cf,
    })
  }, {
    id: 4,
    code: "TMCR",
    name: "The Legend of Zelda: The Minish Cap Randomizer",
    short_name: "The Minish Cap Randomizer",
    data: JSON.stringify({
      color: 0x73C636,
    })
  }, {
    id: 5,
    code: "PKMN_CRYSTAL",
    name: "Pokemon Crystal Randomizer",
    data: JSON.stringify({
      color: 0xFFCB06,
    })
  }, {
    id: 6,
    code: "SMR",
    name: "Super Metroid Randomizer",
    data: JSON.stringify({
      color: 0x127C6A,
    })
  }, {
    id: 7,
    code: "HKR",
    name: "Hollow Knight Randomizer",
    data: JSON.stringify({
      color: 0xCCCCCC,
    })
  }];

  /* Creating legacy mode for existing races */
  const gameModes = gamesList.map(game => ({
    id: game.id,
    game_id: game.id,
    name: "Semanal RBR",
    description: "Modo de jogo padrão para as antigas corridas semanais da Randomizer Brasil.",
    data: JSON.stringify({
      disabled: true
    })
  }));

  /* Insert games and game_modes */
  await queryInterface.bulkInsert("games", gamesList);
  await queryInterface.bulkInsert("game_modes", gameModes);

  // Set games and gamemodes id sequence to the last id used
  await sequelize.query(
    "SELECT setval('games_id_seq', 7)"
  );
  await sequelize.query(
    "SELECT setval('game_modes_id_seq', 7)"
  );

  // Create games variable to index games by code:
  const games = {};
  gamesList.forEach(game =>
    games[game.code] = game
  );


  /* Retrieve all legacy weeklies */
  const weeklies = await sequelize.query(
    "SELECT * FROM weeklies ORDER BY id",
    { type: Sequelize.QueryTypes.SELECT }
  );

  /* Map weeklies into races */
  let raceIdSeq = 0;

  const weekliesMap = new Map();
  for (const weekly of weeklies) {
    ++raceIdSeq;

    const gameId = games[weekly.game].id;
    const gameModeId = gameId;

    const raceData = {
      randomizer: {
        seedUrl: weekly.seed_url,
        seedHash: weekly.seed_hash
      }
    };

    let raceGroupId = 1;
    if (typeof weekly.leaderboard_id === "number") {
      raceData["leaderboard"] = { id: weekly.leaderboard_id };
      raceGroupId = weekly.leaderboard_id + 2;
    }

    const newRace = {
      id: raceIdSeq,
      game_id: gameId,
      gamemode_id: gameModeId,
      status: weekly.status,
      registration_deadline: weekly.submission_end,
      racegroup_id: raceGroupId,
      created_at: now,
      updated_at: now,
      // FrompsBot user
      creator_id: 1,
      data: JSON.stringify(raceData)
    };

    weekliesMap.set(weekly.id, newRace);
  }


  /* Retrieve all legacy leaderboards */
  const leaderboards = await sequelize.query(
    "SELECT * FROM leaderboards ORDER BY id",
    { type: Sequelize.QueryTypes.SELECT }
  );

  /* create default racegroup for legacy weeklies */
  sequelize.query(
    "INSERT INTO race_groups (id, parent_id, name, data) " +
    `VALUES (1, NULL, 'Semanais RBR', '${JSON.stringify({})}')`
  );

  /* Map leaderboards into race_groups */
  let raceGroupId = (leaderboards.length > 0) ? 2 : 1;
  const leaderboardsMap = new Map();
  for (const leaderboard of leaderboards) {
    ++raceGroupId;
    const leaderboardData = leaderboard.leaderboard_data;
    const newLeaderboardData = {
      racesIncluded: leaderboardData.included_weeklies,
      races: leaderboardData.weeklies.map(
        (id) => weekliesMap.get(id).id
      ),
      tiebreak: {}
    };

    for (const position in leaderboardData.tiebreak_data) {
      newLeaderboardData.tiebreak[position] = {
        commonRaces: leaderboardData.tiebreak_data[position].common_weeklies
      };
    }

    const newGroup = {
      id: raceGroupId,
      parent_id: 2,
      name: `Leaderboard S${leaderboard.id}`,
      data: JSON.stringify({
        status: leaderboard.status,
        createdAt: leaderboard.created_at,
        leaderboard: newLeaderboardData
      })
    };

    if (leaderboard.results_url) {
      newGroup.data.resultsUrl = leaderboard.results_url;
    }

    leaderboardsMap.set(leaderboard.id, newGroup);
  }

  if (leaderboards.length > 0) {
    // Insert parent leaderboard
    sequelize.query(
      "INSERT INTO race_groups (id, parent_id, name, data) " +
      `VALUES (2, 1, 'Leaderboards ALTTPR', '${JSON.stringify({})}')`
    );

    // Insert into race_groups
    await queryInterface.bulkInsert("race_groups",
      Array.from(leaderboardsMap.values())
    );
  }

  // Set race_groups id sequence to the last id used
  await sequelize.query(
    `SELECT setval('race_groups_id_seq', ${raceGroupId})`
  );

  if (weeklies.length > 0) {
    /* Bulk insert races */
    await queryInterface.bulkInsert("races", Array.from(weekliesMap.values()));

    // Set races id sequence to the last id used
    await sequelize.query(
      `SELECT setval('races_id_seq', ${raceIdSeq})`
    );
  }


  /* Retrieve all legacy player entries */
  const entries = await sequelize.query(
    "SELECT * FROM player_entries ORDER BY registered_at",
    { type: Sequelize.QueryTypes.SELECT }
  );

  const newEntries = [];
  let entryIdSeq = 0;
  for (const entry of entries) {
    ++entryIdSeq;
    const newEntryData = {};
    if (entry.print_url) { newEntryData.printUrl = entry.print_url; }
    if (entry.vod_url) { newEntryData.vodUrl = entry.vod_url; }
    if (entry.comment) { newEntryData.comment = entry.comment; }
    if (entry.time_submitted_at) {
      newEntryData.timeSubmittedAt = entry.time_submitted_at;
    }
    if (entry.vod_submitted_at) {
      newEntryData.vodSubmittedAt = entry.vod_submitted_at;
    }
    if (entry.leaderboard_data) {
      newEntryData.leaderboard = entry.leaderboard_data;
    }

    newEntries.push({
      id: entryIdSeq,
      race_id: weekliesMap.get(entry.weekly_id).id,
      player_id: playersMap.get(entry.player_discord_id).id,
      status: entry.status,
      finish_time: entry.finish_time,
      data: JSON.stringify(newEntryData),
      created_at: entry.registered_at,
      updated_at: now
    });
  }

  /* Bulk insert race entries */
  if (newEntries.length > 0) {
    await queryInterface.bulkInsert("race_entries", newEntries);
  }

  // Set race_entries id sequence to the last id used
  await sequelize.query(
    `SELECT setval('race_entries_id_seq', ${entryIdSeq})`
  );

  /* Drop old tables */
  queryInterface.dropTable("player_entries");
  queryInterface.dropTable("leaderboard_entries");
  queryInterface.dropTable("weeklies");
  queryInterface.dropTable("leaderboards");
  queryInterface.dropTable("players");
}


module.exports = {
  up
};