import {
  CreationOptional, DataTypes, InferAttributes, InferCreationAttributes,
  HasManyGetAssociationsMixin, HasManySetAssociationsMixin, HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin, NonAttribute
} from "sequelize";

import {
  ModelData, AppModelWithData, createModelWithData, ModelClass
} from "../../app/AppModel";
import Database from "../modules/Database";

import type { RaceEntryModel } from "./raceEntryModel";
import type { RaceModel } from "./raceModel";
import type { UserAccountModel } from "./userAccountModel";

export const USER_MAX_NAME_LENGTH = 32;


// Data types for models are empty because they are meant to be merged with
// later definitions done by consumers
export interface UserData extends ModelData {}

export interface UserModel extends AppModelWithData<
  UserData, InferAttributes<UserModel>, InferCreationAttributes<UserModel>
  > {
  id: CreationOptional<number>;
  name: string;

  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;

  getAccounts: HasManyGetAssociationsMixin<UserAccountModel[]>;
  setAccounts: HasManySetAssociationsMixin<UserAccountModel, number>;
  addAccount: HasManyAddAssociationMixin<UserAccountModel, number>;
  addAccounts: HasManyAddAssociationsMixin<UserAccountModel, number>;
  removeAccount: HasManyRemoveAssociationMixin<UserAccountModel, number>;
  removeAccounts: HasManyRemoveAssociationsMixin<UserAccountModel, number>;
  hasAccount: HasManyHasAssociationMixin<UserAccountModel, number>;
  hasAccounts: HasManyHasAssociationsMixin<UserAccountModel, number>;
  countAccounts: HasManyCountAssociationsMixin;
  createAccount: HasManyCreateAssociationMixin<UserAccountModel, "userId">;

  getRacesCreated: HasManyGetAssociationsMixin<RaceModel[]>;
  setRacesCreated: HasManySetAssociationsMixin<RaceModel, number>;
  addRaceCreated: HasManyAddAssociationMixin<RaceModel, number>;
  addRacesCreated: HasManyAddAssociationsMixin<RaceModel, number>;
  removeRaceCreated: HasManyRemoveAssociationMixin<RaceModel, number>;
  removeRacesCreated: HasManyRemoveAssociationsMixin<RaceModel, number>;
  hasRaceCreated: HasManyHasAssociationMixin<RaceModel, number>;
  hasRacesCreated: HasManyHasAssociationsMixin<RaceModel, number>;
  countRacesCreated: HasManyCountAssociationsMixin;
  createRaceCreated: HasManyCreateAssociationMixin<RaceModel, "creatorId">;

  getEntries: HasManyGetAssociationsMixin<RaceEntryModel[]>;
  setEntries: HasManySetAssociationsMixin<RaceEntryModel, number>;
  addEntry: HasManyAddAssociationMixin<RaceEntryModel, number>;
  addEntries: HasManyAddAssociationsMixin<RaceEntryModel, number>;
  removeEntry: HasManyRemoveAssociationMixin<RaceEntryModel, number>;
  removeEntries: HasManyRemoveAssociationsMixin<RaceEntryModel, number>;
  hasEntry: HasManyHasAssociationMixin<RaceEntryModel, number>;
  hasEntries: HasManyHasAssociationsMixin<RaceEntryModel, number>;
  countEntries: HasManyCountAssociationsMixin;
  createEntry: HasManyCreateAssociationMixin<RaceEntryModel, "playerId">;

  accounts?: NonAttribute<UserAccountModel[]>;
  racesCreated?: NonAttribute<RaceModel[]>;
  entries?: NonAttribute<RaceEntryModel[]>;
}

export type UserModelClass = ModelClass<UserModel>;

export default function createUserModel(db: Database): UserModelClass {
  const sequelize = db.sequelize;

  return createModelWithData<UserModel>("User", {
    name: {
      field: "name",
      type: DataTypes.STRING(USER_MAX_NAME_LENGTH),
      allowNull: false
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
    tableName: "users",
    timestamps: true
  }, sequelize);
}
