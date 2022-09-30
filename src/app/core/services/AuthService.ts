import { UserModel } from "../models/userModel";
import AccountProvider from "../../../constants/AccountProvider";
import UserAccountRepository from "../repositories/UserAccountRepository";
import Result, { Success } from "../logic/Result";
import { ResultError } from "../logic/error/ResultError";
import AppService, { IService } from "../AppService";

declare module "../modules/ContextManager" {
  interface ContextTypeMap {
    [AuthService.loggedUser]: UserModel
  }
}

export class UserNotFoundError extends ResultError {
  constructor(readonly provider: AccountProvider, readonly providerId: string) {
    super("Usuário não encontrado!");
    this.provider = provider;
    this.providerId = providerId;
  }
}

export default class AuthService
  extends AppService
  implements IService<AuthService> {

  async authenticate(provider: AccountProvider, providerId: string) {
    const account = await this.app.repos.userAccount.findOne({
      filter: UserAccountRepository.providerAccountFilter(provider, providerId),
      include: ["user"]
    });

    if (!account) {
      return Result.fail(new UserNotFoundError(provider, providerId));
    }

    if (!account.user) {
      throw new Error("UserAccount query including 'user' returned none.");
    }

    this.login(account.user);
    return Result.success(account.user as UserModel);
  }

  login(user: UserModel) {
    if (this.getLoggedUser().value !== undefined) {
      throw new Error("Attempt to login while an user is already logged in.");
    }

    this.app.context.set(AuthService.loggedUser, user);
    return Result.success();
  }

  logout() {
    this.app.context.delete(AuthService.loggedUser);
    return Result.success();
  }

  getLoggedUser<B extends false>(required?: B): Success<UserModel | undefined>
  getLoggedUser<B extends true>(required: B): Success<UserModel>

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLoggedUser<B extends boolean>(required?: B) {
    return Result.success(this.app.context.get(AuthService.loggedUser));
  }

  // Key to store logged user in a context
  static readonly loggedUser: unique symbol = Symbol("AuthService.loggedUser");
}
