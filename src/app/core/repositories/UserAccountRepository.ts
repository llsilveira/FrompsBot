import { Op } from "sequelize";
import AccountProvider from "../../../constants/AccountProvider";
import AppRepository, { RepositoryFilter } from "../AppRepository";
import { UserAccountModel } from "../models/userAccountModel";

export default class UserAccountRepository
  extends AppRepository<UserAccountModel> {

  static providerAccountFilter(provider: AccountProvider, providerId: string):
    RepositoryFilter<UserAccountModel> {
    const filter: RepositoryFilter<UserAccountModel> = {};

    filter.provider = provider;
    filter.providerId = providerId;

    return filter;
  }

  static userProvidersFilter(
    userId: number,
    providers?: AccountProvider[],
    providerId?: string
  ): RepositoryFilter<UserAccountModel> {
    const userFilter: RepositoryFilter<UserAccountModel> = { userId };
    const filters = [userFilter];

    if (providers) {
      const providersFilter: RepositoryFilter<UserAccountModel> = {
        provider: { [Op.in]: providers }
      };
      filters.push(providersFilter);
    }

    if (providerId) {
      const providerIdFilter: RepositoryFilter<UserAccountModel> = {
        providerId: providerId
      };
      filters.push(providerIdFilter);
    }

    if (filters.length > 1) {
      const combined: RepositoryFilter<UserAccountModel> = {
        [Op.and]: filters
      };
      return combined;
    } else {
      return filters[0];
    }
  }
}