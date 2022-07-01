"use strict";

module.exports = Object.freeze({
  bot: {
    addAdmin: Symbol("Permissions.bot.addAdmin"),
    removeAdmin: Symbol("Permissions.bot.removeAdmin")
  },
  user: {
    changeName: Symbol("Permissions.user.changeName"),
  },
  game: {
    create: Symbol("Permissions.game.create"),
    createMode: Symbol("Permissions.game.createMode"),
    addMonitor: Symbol("Permissions.game.addMonitor"),
    removeMonitor: Symbol("Permissions.game.removeMonitor")
  }
});
