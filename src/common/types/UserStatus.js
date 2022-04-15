"use strict";

const Enum = require("./Enum");

module.exports = class UserStatus extends Enum {
  static ACTIVE = new UserStatus("ACTIVE");
  static BLOCKED = new UserStatus("BLOCKED");
};
