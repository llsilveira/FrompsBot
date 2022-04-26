"use strict";

const { DataTypes } = require("sequelize");

const BaseModel = require("./BaseModel");
const User = require("./User");

const { AccountProvider } = require("@frompsbot/common/values");


module.exports = class UserAccount extends BaseModel {
  static init(sequelize) {
    User.init(sequelize);
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
          model: User,
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

    User.hasMany(UserAccount, {
      as: "accounts",
      foreignKey: { name: "userId" }
    });
    UserAccount.belongsTo(User, {
      as: "user",
      foreignKey: { name: "userId" }
    });

    return model;
  }
};
