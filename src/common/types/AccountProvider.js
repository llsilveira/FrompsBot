"use strict";

const Enum = require("./Enum");

module.exports = class AccountProvider extends Enum {
  static DISCORD = new AccountProvider("DISCORD");
  static TWITCH = new AccountProvider("TWITCH");
};
