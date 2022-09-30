import type Application from "../app/Application";
import runAs from "./runAs";

export default async function runAsBot<T extends unknown[], R>(
  app: Application, callback: (...args: T) => R, ...callbackArgs: T) {
  const botUser = (await app.services.user.getUserFromId(1)).value;

  if (botUser) {
    return runAs(app, botUser, callback, ...callbackArgs);
  } else {
    throw new Error("Bot user not found!");
  }
}
