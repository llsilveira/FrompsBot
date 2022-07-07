"use strict";

const AppModule = require("../../app/AppModule");
const Permissions = require("../../constants/Permissions");
const hasPermissions = require("../../constraints/hasPermissions");
const check = require("../../decorators/check");
const transactional = require("../../decorators/transactional");
const FrompsBotError = require("../../errors/FrompsBotError");

module.exports = class BotService extends AppModule {
  isAdmin(user) {
    const data = user.getData("bot", {});
    return (data.isAdmin === true);
  }

  @check(hasPermissions(Permissions.bot.addAdmin))
  @transactional()
  async addAdmin(user) {
    if (this.isAdmin(user)) {
      throw new FrompsBotError(
        `O usuário ${user.name} já é administrador deste bot!`);
    }

    const data = user.getData("bot", {});
    data.isAdmin = true;
    user.setData("bot", data);
    await user.save();
  }

  @check(hasPermissions(Permissions.bot.removeAdmin))
  @transactional()
  async removeAdmin(user) {
    if (!this.isAdmin(user)) {
      throw new FrompsBotError(
        `O usuário ${user.name} não é administrador deste bot!`);
    }

    const data = user.getData("bot");
    delete data.isAdmin;
    user.setData("bot", data);
    await user.save();
  }

  #app;
};
