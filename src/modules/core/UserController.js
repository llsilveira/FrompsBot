"use strict";

const { transactional } = require("@frompsbot/common/decorators");
const BaseModule = require("@frompsbot/modules/BaseModule");

module.exports = class UserController extends BaseModule {
  constructor({ app }) {
    super({ app });
    this.User = this.app.db.getModel("User");
    this.UserAccount = this.app.db.getModel("UserAccount");
  }

  async getFromProvider(provider, providerId) {
    const accounts = await this.UserAccount.findAll({
      where: { provider, providerId },
      include: "user"
    });
    return (accounts.length <= 0) ? undefined : accounts[0]?.user;
  }

  async searchByName(name) {
    return await this.User.findAll({
      where: { name },
      include: this.UserAccount
    });
  }

  @transactional()
  async setName(user, name) {
    // TODO: check permissions
    // TODO: filter/escape name
    user.name = name;
    await user.save();
  }

  @transactional()
  async register(provider, providerId, { name }) {
    if (await this.getFromProvider(provider, providerId)) {
      throw new Error(`User already registered: ${provider} - ${providerId}`);
    }
    const user = await this.User.create({ name });
    await this.UserAccount.create({
      userId: user.id,
      provider,
      providerId,
    });
  }
};
