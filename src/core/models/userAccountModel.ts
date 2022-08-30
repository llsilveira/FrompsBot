import {
  BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin, CreationOptional, DataTypes, ForeignKey,
  InferAttributes, InferCreationAttributes, NonAttribute
} from "sequelize";

import {
  ModelData, ModelWithData, createModelWithData, ModelClass
} from "../../app/AppModel";

import AccountProvider from "../constants/AccountProvider";
import Database from "../modules/Database";
import type { UserModelClass, UserModel } from "./userModel";

export const USERACCOUNT_MAX_PROVIDERID_LENGTH = 32;


export interface UserAccountData extends ModelData {}

export interface UserAccountModel extends ModelWithData<
  UserAccountData,
  InferAttributes<UserAccountModel>,
  InferCreationAttributes<UserAccountModel>
> {
  id: CreationOptional<number>;
  provider: AccountProvider;
  providerId: string;
  userId: ForeignKey<UserModel["id"]>;

  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;

  getUser: BelongsToGetAssociationMixin<UserModel>;
  setUser: BelongsToSetAssociationMixin<UserModel, number>;
  createUser: BelongsToCreateAssociationMixin<UserModel>;

  user?: NonAttribute<UserModel>;
}

export type UserAccountModelClass = ModelClass<UserAccountModel>


export default function createUserAccountModel(
  db: Database,
  userModel: UserModelClass
): UserAccountModelClass {
  const sequelize = db.sequelize;

  const UserAccount = createModelWithData<UserAccountModel>("UserAccount", {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true
    },

    provider: {
      field: "provider",
      type: DataTypes.ENUM,
      unique: "provider_identity",
      allowNull: false,
      values: Object.keys(AccountProvider),
    },

    providerId: {
      field: "provider_id",
      type: DataTypes.STRING(USERACCOUNT_MAX_PROVIDERID_LENGTH),
      allowNull: false,
      unique: "provider_identity",
    },

    userId: {
      field: "user_id",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
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
    tableName: "user_accounts",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["provider", "user_id"] },
    ],
  }, sequelize);

  userModel.hasMany(UserAccount, {
    as: "accounts",
    foreignKey: { name: "userId" }
  });

  UserAccount.belongsTo(userModel, {
    as: "user",
    foreignKey: { name: "userId" }
  });

  return UserAccount;
}