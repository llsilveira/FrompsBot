"use strict";

const BaseModule = require("@frompsbot/modules/BaseModule");

module.exports = class GameController extends BaseModule {
  constructor({ app }) {
    super({ app });
    this.Game = this.app.db.getModel("Game");
    this.GameMode = this.app.db.getModel("GameMode");
  }
};
