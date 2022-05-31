"use strict";

const { PermissionError } = require("../errors");

module.exports = function hasPermissions(permissions) {
  if (!Array.isArray(permissions)) { permissions = [permissions]; }

  return async function checkPermissions(obj, ...args) {
    const app = obj.app;
    const pc = app.container.resolve("permissionController");

    for (const permission of permissions) {
      const val = await pc[permission].call(pc, ...args);
      if (!val) {
        throw new PermissionError(permission);
      }
    }
    return true;
  };
};
