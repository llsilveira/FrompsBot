"use strict";

const BaseModule = require("@frompsbot/modules/BaseModule");
const { Permissions } = require("@frompsbot/common/constants");


module.exports = class PermissionValidator extends BaseModule {
  async [Permissions.USER.changeName](subject) {
    const user = this.app.auth.getLoggedUser();
    return ((await this.app.user.isAdmin(user)) || user.id === subject.id);
  }

  async [Permissions.GAME.create]() {
    return (await this.app.user.isAdmin(this.app.auth.getLoggedUser()));
  }

  async [Permissions.GAME.createMode](gameCode) {
    return (await this.app.game.isMonitor(
      gameCode, this.app.auth.getLoggedUser()
    ));
  }
};
