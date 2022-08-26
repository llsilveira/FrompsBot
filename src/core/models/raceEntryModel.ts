import {
  BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes,
  NonAttribute
} from "sequelize";

import {
  createModelWithData, ModelClass, ModelData, ModelWithData
} from "../../app/AppModel";

import RaceEntryStatus from "../constants/RaceEntryStatus";
import Database from "../modules/Database";

import type { RaceModel, RaceModelClass } from "./raceModel";
import type { UserModel, UserModelClass } from "./userModel";


// Data types for models are empty because they are meant to be merged with
// later definitions done by consumers
export interface RaceEntryData extends ModelData {}


export interface RaceEntryModel extends ModelWithData<
  RaceEntryData,
  InferAttributes<RaceEntryModel>,
  InferCreationAttributes<RaceEntryModel>
> {
  id: CreationOptional<number>;
  raceId: ForeignKey<RaceModel["id"]>;
  playerId: ForeignKey<UserModel["id"]>;
  status: typeof RaceEntryStatus;

  // TODO: create a time type because Sequelize nor Node/JS has it.
  finishTime?: string;

  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;

  getRace: BelongsToGetAssociationMixin<RaceModel>;
  setRace: BelongsToSetAssociationMixin<RaceModel, number>;
  createRace: BelongsToCreateAssociationMixin<RaceModel>;

  getPlayer: BelongsToGetAssociationMixin<UserModel>;
  setPlayer: BelongsToSetAssociationMixin<UserModel, number>;
  createPlayer: BelongsToCreateAssociationMixin<UserModel>;

  race?: NonAttribute<RaceModel>;
  player?: NonAttribute<UserModel>;
}

export type RaceEntryModelClass = ModelClass<RaceEntryModel>;


export default function createRaceEntryModel(
  db: Database,
  userModel: UserModelClass,
  raceModel: RaceModelClass
): RaceEntryModelClass {
  const sequelize = db.sequelize;

  const RaceEntry = createModelWithData<RaceEntryModel>("RaceEntry", {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

    raceId: {
      field: "race_id",
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "race_player",
      references: {
        model: raceModel,
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    playerId: {
      field: "player_id",
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "race_player",
      references: {
        model: userModel,
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },

    status: {
      field: "status",
      type: DataTypes.ENUM,
      values: Object.keys(RaceEntryStatus),
      allowNull: false,
    },

    finishTime: {
      field: "finish_time",
      type: DataTypes.TIME
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
    tableName: "race_entries",
    timestamps: true
  }, sequelize);

  raceModel.hasMany(RaceEntry, {
    as: "entries",
    foreignKey: { name: "raceId" }
  });

  RaceEntry.belongsTo(raceModel, {
    as: "race",
    foreignKey: { name: "raceId" }
  });

  userModel.hasMany(RaceEntry, {
    as: "entries",
    foreignKey: { name: "playerId" }
  });

  RaceEntry.belongsTo(userModel, {
    as: "player",
    foreignKey: { name: "playerId" }
  });

  return RaceEntry;
}
