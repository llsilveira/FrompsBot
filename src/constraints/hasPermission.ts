import { Permission } from "../constants/Permissions";
import type { IPermissionManager } from "../app/core/modules/PermissionManager";
import { type AppBound } from "../app/core/type";
import { Constraint } from "../decorators/check";
import PermissionError from "../errors/PermissionError";


export default function hasPermission<P extends Permission>(
  permission: P
): Constraint<AppBound, Parameters<IPermissionManager[P]>> {
  return async function checkPermissions(
    obj: AppBound, ...args: Parameters<IPermissionManager[P]>
  ) {
    const app = obj.app;
    const pm = app.permissionManager;

    const val = await (pm[permission] as IPermissionManager[P])(...args);
    if (!val) {
      throw new PermissionError(permission);
    }
    return true;
  };
}
