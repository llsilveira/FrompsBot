import { BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, HasManyAddAssociationMixin, HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin, HasManySetAssociationsMixin, InferAttributes,
  InferCreationAttributes, NonAttribute
} from "sequelize";

import {
  createModelWithData, ModelClass, ModelData, ModelWithData
} from "../../app/AppModel";

import RaceStatus from "../constants/RaceStatus";
import Database from "../modules/Database";

import type { GameModel, GameModelClass } from "./gameModel";
import type { GameModeModel, GameModeModelClass } from "./gameModeModel";
import type { RaceEntryModel } from "./raceEntryModel";
import type { RaceGroupModel, RaceGroupModelClass } from "./raceGroupModel";
import type { UserModel, UserModelClass } from "./userModel";


export interface RaceData extends ModelData {}

export interface RaceModel extends ModelWithData<
  RaceData,
  InferAttributes<RaceModel>,
  InferCreationAttributes<RaceModel>
> {
  id: CreationOptional<number>;
  status: typeof RaceStatus;
  registrationDeadline: Date;

  creatorId: ForeignKey<UserModel["id"]>;
  gameId: ForeignKey<GameModel["id"]>;

  // FK constraint created on migration since sequelize does not have a way to
  // declare associations with composite keys inside the  model definition.
  gameModeId: ForeignKey<GameModeModel["id"]>;
  raceGroupId: ForeignKey<RaceGroupModel["id"]>;

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

  getRaceGrop: BelongsToGetAssociationMixin<RaceGroupModel>;
  setRaceGrop: BelongsToSetAssociationMixin<RaceGroupModel, number>;
  createRaceGrop: BelongsToCreateAssociationMixin<RaceGroupModel>;

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
  raceGroup?: NonAttribute<RaceGroupModel>;
  entries?: NonAttribute<RaceEntryModel[]>;
}

export type RaceModelClass = ModelClass<RaceModel>


export default function createRaceModel(
  db: Database,
  userModel: UserModelClass,
  gameModel: GameModelClass,
  gameModeModel: GameModeModelClass,
  raceGroupModel: RaceGroupModelClass
): RaceModelClass {
  const sequelize = db.sequelize;

  const Race = createModelWithData<RaceModel>("Race", {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

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

    status: {
      field: "status",
      type: DataTypes.ENUM,
      values: Object.keys(RaceStatus),
      allowNull: false,
    },

    registrationDeadline: {
      field: "registration_deadline",
      type: DataTypes.DATE
    },

    raceGroupId: {
      field: "racegroup_id",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: raceGroupModel,
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

  raceGroupModel.hasMany(Race, {
    as: "races",
    foreignKey: { name: "raceGroupId" }
  });

  Race.belongsTo(raceGroupModel, {
    as: "raceGroup",
    foreignKey: { name: "raceGroupId" }
  });

  return Race;
}
