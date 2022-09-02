import {
  BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, HasManyAddAssociationMixin, HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes,
  InferCreationAttributes, NonAttribute
} from "sequelize";

import {
  createModelWithData, ModelClass, ModelData, AppModelWithData
} from "../../app/AppModel";
import Database from "../modules/Database";

import type { GameModel, GameModelClass } from "./gameModel";
import type { RaceModel } from "./raceModel";

export const GAMEMODE_MAX_NAME_LENGTH = 24;
export const GAMEMODE_MAX_DESCRIPTION_LENGTH = 80;
export const GAMEMODE_MAX_LONGDESCRIPTION_LENGTH = 1500;


// Data types for models are empty because they are meant to be merged with
// later definitions done by consumers
export interface GameModeData extends ModelData {}


export interface GameModeModel extends AppModelWithData<
  GameModeData, InferAttributes<GameModeModel>, InferCreationAttributes<GameModeModel>
  > {
  id: CreationOptional<number>;
  name: string;
  description: string;
  longDescription: CreationOptional<string>;

  gameId: ForeignKey<GameModel["id"]>;

  getGame: BelongsToGetAssociationMixin<GameModel>;
  setGame: BelongsToSetAssociationMixin<GameModel, number>;
  createGame: BelongsToCreateAssociationMixin<GameModel>;

  getRaces: HasManyGetAssociationsMixin<RaceModel[]>;
  setRaces: HasManySetAssociationsMixin<RaceModel, number>;
  addRace: HasManyAddAssociationMixin<RaceModel, number>;
  addRaces: HasManyAddAssociationsMixin<RaceModel, number>;
  removeRace: HasManyRemoveAssociationMixin<RaceModel, number>;
  removeRaces: HasManyRemoveAssociationsMixin<RaceModel, number>;
  hasRace: HasManyHasAssociationMixin<RaceModel, number>;
  hasRaces: HasManyHasAssociationsMixin<RaceModel, number>;
  countRaces: HasManyCountAssociationsMixin;
  createRace: HasManyCreateAssociationMixin<RaceModel, "gameModeId">;

  game?: NonAttribute<GameModel>;
  races?: NonAttribute<RaceModel[]>;
}

export type GameModeModelClass = ModelClass<GameModeModel>;


export default function createGameModeModel(
  db: Database,
  gameModel: GameModelClass
): GameModeModelClass {
  const sequelize = db.sequelize;

  const GameMode = createModelWithData<GameModeModel>("GameMode", {
    name: {
      field: "name",
      type: DataTypes.STRING(GAMEMODE_MAX_NAME_LENGTH),
      allowNull: false
    },

    description: {
      field: "description",
      type: DataTypes.STRING(GAMEMODE_MAX_DESCRIPTION_LENGTH),
      allowNull: false
    },

    longDescription: {
      field: "long_description",
      type: DataTypes.TEXT,
      validate: {
        "len": [0, GAMEMODE_MAX_LONGDESCRIPTION_LENGTH]
      },
      defaultValue: ""
    },

    gameId: {
      field: "game_id",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: gameModel,
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    }
  }, {
    tableName: "game_modes",
    // We store gamemode names with case to be used later the same way the user
    // typed them, but they must be unique per game not considering the case.
    indexes: [{
      name: "game_modes_unique_game_id_upper_name",
      unique: true,
      fields: [
        "gameId", sequelize.fn("upper", sequelize.col("name"))
      ]
    }]
  }, sequelize);

  gameModel.hasMany(GameMode, {
    as: "modes",
    foreignKey: { name: "gameId" }
  });

  GameMode.belongsTo(gameModel, {
    as: "game",
    foreignKey: { name: "gameId" }
  });

  return GameMode;
}
