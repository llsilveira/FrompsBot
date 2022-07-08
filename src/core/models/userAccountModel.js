"use strict";

const { DataTypes } = require("sequelize");

const { AppModelWithData } = require("../../app");
const { AccountProvider } = require("../constants");

module.exports = function userAccountModel(db, userModel) {

  class UserAccount extends AppModelWithData {
    static init(sequelize) {
      userModel.init(sequelize);
      const model = super.init(sequelize, "user_accounts", {
        provider: {
          field: "provider",
          type: DataTypes.ENUM,
          values: Object.keys(AccountProvider),
          primaryKey: true,
        },

        providerId: {
          field: "provider_id",
          type: DataTypes.STRING(32),
          primaryKey: true,
        },

        userId: {
          field: "user_id",
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: userModel,
            key: "id",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE"
          }
        }
      }, {
        timestamps: true,
        indexes: [
          { unique: true, fields: ["provider", "user_id"] },
        ],
      });

      userModel.hasMany(UserAccount, {
        as: "accounts",
        foreignKey: { name: "userId" }
      });
      UserAccount.belongsTo(userModel, {
        as: "user",
        foreignKey: { name: "userId" }
      });

      return model;
    }
  }

  db.registerModel(UserAccount);
  return UserAccount;
};
