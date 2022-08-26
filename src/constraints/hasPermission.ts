import { Permission } from "../core/constants/Permissions";
import type { IPermissionService } from "../core/services/PermissionService";
import { type AppBound } from "../core/type";
import { Constraint } from "../decorators/check";
import PermissionError from "../errors/PermissionError";


export default function hasPermission<P extends Permission>(
  permission: P
): Constraint<AppBound, Parameters<IPermissionService[P]>> {
  return async function checkPermissions(
    obj: AppBound, ...args: Parameters<IPermissionService[P]>
  ) {
    const app = obj.app;
    const pc = app.services.permission;

    const val = await (pc[permission] as IPermissionService[P])(...args);
    if (!val) {
      throw new PermissionError(permission);
    }
    return true;
  };
}
