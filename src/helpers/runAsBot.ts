import type Application from "../app/Application";
import runAs from "./runAs";

export default async function runAsBot<T extends unknown[], R>(
  app: Application, callback: (...args: T) => R, ...callbackArgs: T) {
  const botUser = await app.services.user.getFromId(1);

  if (botUser) {
    return runAs(app, botUser, callback, ...callbackArgs);
  } else {
    throw new Error("User not found");
  }
}
