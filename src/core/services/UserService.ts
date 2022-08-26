import { Attributes, FindOptions, WhereOptions } from "sequelize";
import Application from "../../app/Application";
import AppModule from "../../app/AppModule";
import hasPermission from "../../constraints/hasPermission";
import check from "../../decorators/check";
import transactional from "../../decorators/transactional";
import AccountProvider from "../constants/AccountProvider";
import Permissions from "../constants/Permissions";
import { UserModel } from "../models/userModel";


export type UserServiceDataFilter = WhereOptions<Attributes<UserModel>>

export interface UserServiceOptions {
  ordered?: boolean
}

export default class UserService extends AppModule {
  constructor(app: Application) {
    super(app);
  }

  // TODO: change type
  async listUsersFilterByData(
    dataFilter: UserServiceDataFilter = {}, options: UserServiceOptions = {}
  ) {
    const queryOptions = this.processQueryOptions(options);

    queryOptions.where = dataFilter;
    return await this.app.models.user.findAll(queryOptions);
  }

  async getFromProvider(provider: AccountProvider, providerId: string) {
    const accounts = await this.app.models.userAccount.findAll({
      where: { provider, providerId },
      include: "user"
    });
    return (accounts.length <= 0) ? undefined : accounts[0]?.user;
  }

  async getFromId(userId: number) {
    return await this.app.models.user.findByPk(userId);
  }

  async getProvider(user: UserModel, provider: AccountProvider) {
    return await this.app.models.userAccount.findOne({
      where: {
        provider: provider,
        userId: user.id
      }
    });
  }

  async searchByName(name: string) {
    return await this.app.models.user.findAll({
      where: { name },
      include: "accounts"
    });
  }

  @transactional()
  @check(
    hasPermission(Permissions.user.changeName),
    (args: [UserModel, string]) => [args[0]] as [UserModel]
  )
  async setName(user: UserModel, name: string) {
    // TODO: filter/escape name
    user.name = name;
    await user.save();
  }

  @transactional()
  async register(
    provider: AccountProvider,
    providerId: string,
    name: string
  ) {
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
  async getOrRegister(
    provider: AccountProvider,
    providerId: string,
    name: string
  ) {
    let user = await this.getFromProvider(provider, providerId);
    if (!user) {
      user = await this.register(provider, providerId, name);
    }

    return user;
  }

  processQueryOptions(options: UserServiceOptions) {
    const queryOptions: FindOptions<Attributes<UserModel>> = { where: {} };

    if (options?.ordered) {
      queryOptions.order = [["name", "ASC"]];
    }
    return queryOptions;
  }
}
