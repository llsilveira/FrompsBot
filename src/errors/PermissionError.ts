import { type Permission } from "../core/constants/Permissions";
import CheckError from "./CheckError";


export default class PermissionError extends CheckError {
  constructor(readonly permission: Permission) {
    super(`User does not have a required permission: ${permission.toString()}`);
    this.permission = permission;
  }
}
