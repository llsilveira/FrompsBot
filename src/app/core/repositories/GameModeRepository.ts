import { Sequelize } from "sequelize";
import AppRepository, { RepositoryFilter } from "../AppRepository";
import { GameModeModel } from "../models/gameModeModel";

export class GameModeRepository extends AppRepository<GameModeModel> {
  static searchNameFilter(nameFilter: string) {
    return GameModeRepository.strAttrFilter<GameModeModel>(
      "name", nameFilter, { caseSensitive: false }
    );
  }

  static nameIgnoreCaseFilter(name: string) {
    const filter: RepositoryFilter<GameModeModel> = Sequelize.where(
      Sequelize.fn("upper", Sequelize.col("name")), name.toUpperCase()
    );

    return filter;
  }
}