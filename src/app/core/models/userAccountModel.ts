import {
  BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin, CreationOptional, DataTypes, ForeignKey,
  InferAttributes, InferCreationAttributes, NonAttribute
} from "sequelize";

import {
  ModelData, AppModelWithData, createModelWithData, ModelClass
} from "../AppModel";

import AccountProvider from "../../../constants/AccountProvider";
import type { UserModelClass, UserModel } from "./userModel";
import Application from "../../Application";

export const USERACCOUNT_MAX_PROVIDERID_LENGTH = 32;


export interface UserAccountData extends ModelData {}

export interface UserAccountModel extends AppModelWithData<
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
  app: Application,
  userModel: UserModelClass
): UserAccountModelClass {
  const sequelize = app.db.sequelize;

  const UserAccount = createModelWithData<UserAccountModel>("UserAccount", {
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
