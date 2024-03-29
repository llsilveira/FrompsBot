import { BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, HasManyAddAssociationMixin, HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes,
  InferCreationAttributes, NonAttribute
} from "sequelize";

import {
  createModelWithData, ModelClass, ModelData, AppModelWithData
} from "../AppModel";

import type { GameModel, GameModelClass } from "./gameModel";
import type { GameModeModel, GameModeModelClass } from "./gameModeModel";
import type { RaceEntryModel } from "./raceEntryModel";
import type { UserModel, UserModelClass } from "./userModel";
import Application from "../../Application";


export interface RaceData extends ModelData {}

export interface RaceModel extends AppModelWithData<
  RaceData,
  InferAttributes<RaceModel>,
  InferCreationAttributes<RaceModel>
> {
  id: CreationOptional<number>;
  creatorId: ForeignKey<UserModel["id"]>;
  gameId: ForeignKey<GameModel["id"]>;

  // FK constraint created on migration since sequelize does not have a way to
  // declare associations with composite keys inside the  model definition.
  gameModeId: ForeignKey<GameModeModel["id"]>;

  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;

  getCreator: BelongsToGetAssociationMixin<UserModel>;
  setCreator: BelongsToSetAssociationMixin<UserModel, number>;
  createCreator: BelongsToCreateAssociationMixin<UserModel>;

  getGame: BelongsToGetAssociationMixin<GameModel>;
  setGame: BelongsToSetAssociationMixin<GameModel, number>;
  createGame: BelongsToCreateAssociationMixin<GameModel>;

  getGameMode: BelongsToGetAssociationMixin<GameModeModel>;
  setGameMode: BelongsToSetAssociationMixin<GameModeModel, number>;
  createGameMode: BelongsToCreateAssociationMixin<GameModeModel>;

  getEntries: HasManyGetAssociationsMixin<RaceEntryModel[]>;
  setEntries: HasManySetAssociationsMixin<RaceEntryModel, number>;
  addEntry: HasManyAddAssociationMixin<RaceEntryModel, number>;
  addEntries: HasManyAddAssociationsMixin<RaceEntryModel, number>;
  removeEntry: HasManyRemoveAssociationMixin<RaceEntryModel, number>;
  removeEntries: HasManyRemoveAssociationsMixin<RaceEntryModel, number>;
  hasEntry: HasManyHasAssociationMixin<RaceEntryModel, number>;
  hasEntries: HasManyHasAssociationsMixin<RaceEntryModel, number>;
  countEntries: HasManyCountAssociationsMixin;
  createEntry: HasManyCreateAssociationMixin<RaceEntryModel, "raceId">;

  creator?: NonAttribute<UserModel>;
  game?: NonAttribute<GameModel>;
  gameMode?: NonAttribute<GameModeModel>;
  entries?: NonAttribute<RaceEntryModel[]>;
}

export type RaceModelClass = ModelClass<RaceModel>


export default function createRaceModel(
  app: Application,
  userModel: UserModelClass,
  gameModel: GameModelClass,
  gameModeModel: GameModeModelClass
): RaceModelClass {
  const sequelize = app.db.sequelize;

  const Race = createModelWithData<RaceModel>("Race", {
    creatorId: {
      field: "creator_id",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
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
    },

    gameModeId: {
      field: "gamemode_id",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: gameModel,
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    createdAt: {
      field: "created_at",
      type: DataTypes.DATE
    },

    updatedAt: {
      field: "updated_at",
      type: DataTypes.DATE
    },
  }, {
    tableName: "races",
    timestamps: true
  }, sequelize);

  userModel.hasMany(Race, {
    as: "racesCreated",
    foreignKey: { name: "creatorId" }
  });

  Race.belongsTo(userModel, {
    as: "creator",
    foreignKey: { name: "creatorId" }
  });

  gameModel.hasMany(Race, {
    as: "races",
    foreignKey: { name: "gameId" }
  });

  Race.belongsTo(gameModel, {
    as: "game",
    foreignKey: { name: "gameId" }
  });

  gameModeModel.hasMany(Race, {
    as: "races",
    foreignKey: { name: "gameModeId" }
  });

  Race.belongsTo(gameModeModel, {
    as: "gameMode",
    foreignKey: { name: "gameModeId" }
  });

  return Race;
}
