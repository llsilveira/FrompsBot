import hasPermission from "../../../constraints/hasPermission";
import check from "../../../decorators/check";
import transactional from "../../../decorators/transactional";
import AccountProvider from "../../../constants/AccountProvider";
import Permissions from "../../../constants/Permissions";
import { UserModel } from "../models/userModel";
import UserAccountRepository from "../repositories/UserAccountRepository";
import Result, { Fail } from "../logic/Result";
import { ResultError } from "../logic/error/ResultError";
import { RepositoryFindOptions } from "../AppRepository";
import AppService, { IService } from "../AppService";


export class UserAlreadyRegisteredError extends ResultError {
  constructor() {
    super("Esta conta já foi previamente registrada neste bot.");
  }
}


export default class UserService
  extends AppService
  implements IService<UserService> {

  async listUsers(options?: RepositoryFindOptions<UserModel>) {
    return Result.success(await this.app.repos.user.findMany(options));
  }

  async getUserFromId(
    userId: number,
    options?: RepositoryFindOptions<UserModel>
  ) {
    return Result.success(await this.app.repos.user.findById(userId, options));
  }

  async getUserFromProvider(provider: AccountProvider, providerId: string) {
    const userAccount = await this.app.repos.userAccount.findOne({
      filter: UserAccountRepository.providerAccountFilter(provider, providerId),
      include: ["user"]
    });

    if (!userAccount || !userAccount.user) {
      return Result.success(null);
    }
    return Result.success(userAccount.user as UserModel);
  }

  async getUserAccounts(
    userId: number,
    providers?: AccountProvider | AccountProvider[],
    providerId?: string
  ) {
    if (providers && !Array.isArray(providers)) {
      providers = [providers];
    }

    const accounts = await this.app.repos.userAccount.findMany({
      filter: UserAccountRepository.userProvidersFilter(
        userId, providers, providerId)
    });

    return Result.success(accounts);
  }

  @transactional()
  @check(
    hasPermission(Permissions.user.changeName),
    (args: [UserModel, string]) => [args[0]] as [UserModel]
  )
  async setName(user: UserModel, name: string) {
    // TODO: filter/escape name
    user.name = name;
    await this.app.repos.user.save(user);
    return Result.success();
  }

  @transactional()
  async register(
    provider: AccountProvider,
    providerId: string,
    name: string
  ) {
    if ((await this.getUserFromProvider(provider, providerId)).value) {
      return Result.fail(new UserAlreadyRegisteredError());
    }

    const user = await this.app.models.user.create({ name });
    await this.app.models.userAccount.create({
      userId: user.id,
      provider,
      providerId,
    });
    return Result.success(user);
  }

  @transactional()
  async getOrRegister(
    provider: AccountProvider,
    providerId: string,
    name: string
  ) {
    const user = (await this.getUserFromProvider(provider, providerId)).value;
    if (user) {
      return Result.success(user);
    } else {
      const result = await this.register(provider, providerId, name);
      return result as Exclude<typeof result, Fail<UserAlreadyRegisteredError>>;
    }
  }
}
