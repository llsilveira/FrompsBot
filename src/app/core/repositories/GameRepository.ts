import AppRepository, { RepositoryFilter } from "../AppRepository";
import { GameModel } from "../models/gameModel";

export default class GameRepository extends AppRepository<GameModel> {
  static codeFilter(code: string) {
    const filter: RepositoryFilter<GameModel> = { code: code.toUpperCase() };
    return filter;
  }
}
