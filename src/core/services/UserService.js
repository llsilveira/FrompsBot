"use strict";

const { check, transactional } = require("../../decorators");
const { hasPermissions } = require("../../constraints");
const { Permissions } = require("../constants");
const AppModule = require("../../app/AppModule");

module.exports = class UserService extends AppModule {
  async listUsersFilterByData(dataFilter, options = {}) {
    const queryOptions = this.processQueryOptions(options);

    const query = { data: {} };
    for (const dataKey in dataFilter) {
      query.data[dataKey] = dataFilter[dataKey];
    }

    queryOptions.where = query;
    return await this.app.models.user.findAll(queryOptions);
  }

  async getFromProvider(provider, providerId) {
    const accounts = await this.app.models.userAccount.findAll({
      where: { provider, providerId },
      include: "user"
    });
    return (accounts.length <= 0) ? undefined : accounts[0]?.user;
  }

  async getFromId(userId) {
    return await this.app.models.user.findByPk(userId);
  }

  async getProvider(user, provider) {
    return await this.app.models.userAccount.findOne({
      where: {
        provider: provider,
        userId: user.id
      }
    });
  }

  async searchByName(name) {
    return await this.app.models.user.findAll({
      where: { name },
      include: "accounts"
    });
  }

  @transactional()
  @check(hasPermissions(Permissions.user.changeName), (args) => [args[0]])
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
    const user = await this.app.models.user.create({ name });
    await this.app.models.userAccount.create({
      userId: user.id,
      provider,
      providerId,
    });
    return user;
  }

  @transactional()
  async getOrRegister(provider, providerId, name) {
    let user = await this.getFromProvider(provider, providerId);
    if (!user) {
      user = await this.register(provider, providerId, name);
    }

    return user;
  }

  processQueryOptions(options) {
    const queryOptions = { where: {} };

    if (options?.ordered) {
      queryOptions.order = [["name", "ASC"]];
    }
    return queryOptions;
  }
};
