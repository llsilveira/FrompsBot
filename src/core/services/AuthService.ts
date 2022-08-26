import Application from "../../app/Application";
import AppModule from "../../app/AppModule";

import AuthenticationError from "../../errors/AuthenticationError";
import { UserModel } from "../models/userModel";


export default class AuthService extends AppModule {
  constructor(app: Application) {
    super(app);
  }

  login(user: UserModel) {
    // TODO: create different exceptions to represent each error

    if (typeof this.getLoggedUser() !== "undefined") {
      throw new AuthenticationError(
        "A user is already logged in in this context");
    }

    this.app.context.set(AuthService.loggedUser, user);
  }

  logout() {
    this.app.context.delete(AuthService.loggedUser);
  }

  getLoggedUser(): UserModel {
    return this.app.context.get(AuthService.loggedUser) as UserModel;
  }

  // Key to store logged user in a context
  static readonly loggedUser: unique symbol = Symbol("AuthService.loggedUser");
}
