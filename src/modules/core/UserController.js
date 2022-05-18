"use strict";

const { check, transactional } = require("@frompsbot/common/decorators");
const { hasPermissions } = require("@frompsbot/common/constraints");
const { Permissions, Roles } = require("@frompsbot/common/constants");

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

  async getProvider(user, provider) {
    return await this.UserAccount.findOne({
      where: {
        provider: provider,
        userId: user.id
      }
    });
  }

  async searchByName(name) {
    return await this.User.findAll({
      where: { name },
      include: this.UserAccount
    });
  }

  async getRoles(user) {
    const userRoles = (await user.data).roles;

    const roles = {};
    if (!userRoles) { return roles; }

    for (const roleName in userRoles) {
      roles[Roles[roleName]] = userRoles[roleName];
    }
    return roles;
  }

  async isAdmin(user) {
    return ((await this.getRoles(user))[Roles.ADMIN] === true);
  }

  @check(hasPermissions(Permissions.USER.changeName), (args) => [args[0]])
  @transactional()
  async setName(user, name) {
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
    return user;
  }
};
