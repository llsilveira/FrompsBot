import AccountProvider from "../../../constants/AccountProvider";
import AppRepository, { RepositoryFilter, RepositoryFindOptions } from "../AppRepository";
import { UserAccountModel } from "../models/userAccountModel";

interface UserAccountFindOptions
  extends RepositoryFindOptions<UserAccountModel> {
  include?: ("user")[]
}

export default class UserAccountRepository
  extends AppRepository<UserAccountModel, UserAccountFindOptions> {

  static providerFilter(provider: AccountProvider, providerId: string):
    RepositoryFilter<UserAccountModel> {
    const filter: RepositoryFilter<UserAccountModel> = {};

    filter.provider = provider;
    filter.providerId = providerId;

    return filter;
  }

  protected processOptions(options?: UserAccountFindOptions) {
    const queryOptions = super.processOptions(options);

    if (options?.include) {
      queryOptions.include = options.include;
    }

    return queryOptions;
  }
}