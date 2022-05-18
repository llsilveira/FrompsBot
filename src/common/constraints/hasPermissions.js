"use strict";

const { CheckPermissionError } = require("@frompsbot/common/errors");

module.exports = function hasPermissions(permissions) {
  if (!Array.isArray(permissions)) { permissions = [permissions]; }

  return async function checkPermissions(obj, ...args) {
    const pm = obj.app.permission;

    for (const permission of permissions) {
      const val = await pm[permission].call(pm, ...args);
      if (!val) {
        throw new CheckPermissionError(permission);
      }
    }
    return true;
  };
};
