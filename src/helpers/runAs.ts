import type Application from "../app/Application";
import { UserModel } from "../core/models/userModel";

export default function runAs<T extends unknown[], R>(
  app: Application, user: UserModel, callback: (...args: T) => R, ...callbackArgs: T
): R {
  return app.context.run(() => {
    app.services.auth.login(user);
    return callback(...callbackArgs);
  });
}
