"use strict";

const { check, transactional } = require("../decorators");
const { hasPermissions } = require("../constraints");
const { Permissions } = require("../constants");

module.exports = class UserController {
  constructor(app, userModel, userAccountModel) {
    this.#userModel = userModel;
    this.#userAccountModel = userAccountModel;

    this.#app = app;
  }

  get app() {
    return this.#app;
  }

  async getFromProvider(provider, providerId) {
    const accounts = await this.#userAccountModel.findAll({
      where: { provider, providerId },
      include: "user"
    });
    return (accounts.length <= 0) ? undefined : accounts[0]?.user;
  }

  async getOrRegister(provider, providerId, name) {
    let user = await this.getFromProvider(provider, providerId);
    if (!user) {
      user = await this.register(provider, providerId, name);
    }

    return user;
  }

  async getProvider(user, provider) {
    return await this.#userAccountModel.findOne({
      where: {
        provider: provider,
        userId: user.id
      }
    });
  }

  async searchByName(name) {
    return await this.#userModel.findAll({
      where: { name },
      include: this.#userAccountModel
    });
  }

  @check(hasPermissions(Permissions.user.changeName), (args) => [args[0]])
  @transactional()
  async setName(user, name) {
    // TODO: filter/escape name
    user.name = name;
    await user.save();
  }

  @transactional()
  async register(provider, providerId, name) {
    if (await this.getFromProvider(provider, providerId)) {
      throw new Error(`User already registered: ${provider} - ${providerId}`);
    }
    const user = await this.#userModel.create({ name });
    await this.#userAccountModel.create({
      userId: user.id,
      provider,
      providerId,
    });
    return user;
  }

  #userModel;
  #userAccountModel;

  #app;
};
