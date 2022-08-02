"use strict";

module.exports = Object.freeze({
  bot: {
    listAdmins: Symbol("Permissions.bot.listAdmins"),
    addAdmin: Symbol("Permissions.bot.addAdmin"),
    removeAdmin: Symbol("Permissions.bot.removeAdmin"),
    listMonitors: Symbol("Permissions.bot.listMonitors"),
    addMonitor: Symbol("Permissions.bot.addMonitor"),
    removeMonitor: Symbol("Permissions.bot.removeMonitor")
  },
  user: {
    changeName: Symbol("Permissions.user.changeName"),
  },
  game: {
    create: Symbol("Permissions.game.create"),
    remove: Symbol("Permissions.game.remove"),
    createMode: Symbol("Permissions.game.createMode"),
    removeMode: Symbol("Permissions.game.removeMode")
  },
  race: {
    create: Symbol("Permissions.race.create"),
    remove: Symbol("Permissions.race.remove"),
    update: Symbol("Permissions.race.update"),
    createGroup: Symbol("Permissions.race.createGroup"),
    removeGroup: Symbol("Permissions.race.removeGroup"),
    updateGroup: Symbol("Permissions.race.updateGroup"),
    updateEntry: Symbol("Permissions.race.updateEntry"),
  }
});
