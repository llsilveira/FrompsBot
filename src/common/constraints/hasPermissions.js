"use strict";

const { PermissionError } = require("@frompsbot/common/errors");

module.exports = function hasPermissions(permissions) {
  if (!Array.isArray(permissions)) { permissions = [permissions]; }

  return async function checkPermissions(obj, ...args) {
    const pm = obj.app.permission;

    for (const permission of permissions) {
      const val = await pm[permission].call(pm, ...args);
      if (!val) {
        throw new PermissionError(permission);
      }
    }
    return true;
  };
};
