"use strict";

const CheckError = require("./CheckError");

module.exports = class PermissionError extends CheckError {
  constructor(permission) {
    super(`User does not have a required permission: ${permission.toString()}`);
    this.permission = permission;
  }
};