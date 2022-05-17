"use strict";

const BaseModule = require("@frompsbot/modules/BaseModule");
const { Permissions } = require("@frompsbot/common/constants");


module.exports = class PermissionValidator extends BaseModule {
  async [Permissions.USER.changeName](subject) {
    const user = this.app.auth.getLoggedUser();

    return ((await this.app.user.isAdmin(user)) || user.id === subject.id);
  }
};
