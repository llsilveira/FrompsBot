import {
  CreationOptional, DataTypes, HasManyAddAssociationMixin, HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes,
  InferCreationAttributes, NonAttribute
} from "sequelize";
import Application from "../../Application";

import {
  createModelWithData, ModelClass, ModelData, AppModelWithData
} from "../AppModel";

import type { GameModeModel } from "./gameModeModel";
import type { RaceModel } from "./raceModel";

export const GAME_MAX_CODE_LENGTH = 24;
export const GAME_MAX_NAME_LENGTH = 64;
export const GAME_MAX_SHORTNAME_LENGTH = 32;


// Data types for models are empty because they are meant to be merged with
// later definitions done by consumers
export interface GameData extends ModelData {}

export interface GameModel extends AppModelWithData<
  GameData, InferAttributes<GameModel>, InferCreationAttributes<GameModel>
  > {
  id: CreationOptional<number>;
  code: string;
  name: string;
  shortName: CreationOptional<string>;

  getModes: HasManyGetAssociationsMixin<GameModeModel[]>;
  setModes: HasManySetAssociationsMixin<GameModeModel, [number, number]>;
  addMode: HasManyAddAssociationMixin<GameModeModel, [number, number]>;
  addModes: HasManyAddAssociationsMixin<GameModeModel, [number, number]>;
  removeMode: HasManyRemoveAssociationMixin<GameModeModel, [number, number]>;
  removeModes: HasManyRemoveAssociationsMixin<GameModeModel, [number, number]>;
  hasMode: HasManyHasAssociationMixin<GameModeModel, [number, number]>;
  hasModes: HasManyHasAssociationsMixin<GameModeModel, [number, number]>;
  countModes: HasManyCountAssociationsMixin;
  createMode: HasManyCreateAssociationMixin<GameModeModel, "gameId">;

  getRaces: HasManyGetAssociationsMixin<RaceModel[]>;
  setRaces: HasManySetAssociationsMixin<RaceModel, number>;
  addRace: HasManyAddAssociationMixin<RaceModel, number>;
  addRaces: HasManyAddAssociationsMixin<RaceModel, number>;
  removeRace: HasManyRemoveAssociationMixin<RaceModel, number>;
  removeRaces: HasManyRemoveAssociationsMixin<RaceModel, number>;
  hasRace: HasManyHasAssociationMixin<RaceModel, number>;
  hasRaces: HasManyHasAssociationsMixin<RaceModel, number>;
  countRaces: HasManyCountAssociationsMixin;
  createRace: HasManyCreateAssociationMixin<RaceModel, "gameId">;

  modes?: NonAttribute<GameModeModel[]>;
  races?: NonAttribute<RaceModel[]>;
}

export type GameModelClass = ModelClass<GameModel>;


export default function createGameModel(app: Application): GameModelClass {
  const sequelize = app.db.sequelize;

  return createModelWithData<GameModel>("Game", {
    code: {
      field: "code",
      type: DataTypes.STRING(GAME_MAX_CODE_LENGTH),
      allowNull:false,
      // unique constraint below
      set(value: string) {
        this.setDataValue("code", value.toUpperCase());
      }
    },

    name: {
      field: "name",
      type: DataTypes.STRING(GAME_MAX_NAME_LENGTH),
      allowNull: false,
      unique: true
    },

    shortName: {
      field: "short_name",
      type: DataTypes.STRING(GAME_MAX_SHORTNAME_LENGTH),
      get() {
        const raw = this.getDataValue("shortName");
        if (!raw) { return this.name; }
        return raw;
      }
    }
  }, {
    tableName: "games",
    indexes: [{
      name: "games_unique_upper_code",
      unique: true,
      fields: [sequelize.fn("upper", sequelize.col("code"))]
    }]
  }, sequelize);

}
