export type Permission = {
  [key in keyof Omit<typeof Permissions, "prototype">]:
    (typeof Permissions)[key][keyof Omit<(typeof Permissions)[key], "prototype">]
}[Exclude<keyof (typeof Permissions), "prototype">];


export default class Permissions {
  static readonly bot = class {
    static readonly listAdmins: unique symbol = Symbol("Permission.bot.listAdmins");
    static readonly addAdmin: unique symbol = Symbol("Permission.bot.listAdmins");
    static readonly removeAdmin: unique symbol = Symbol("Permission.bot.listAdmins");
    static readonly listMonitors: unique symbol = Symbol("Permission.bot.listAdmins");
    static readonly addMonitor: unique symbol = Symbol("Permission.bot.listAdmins");
    static readonly removeMonitor: unique symbol = Symbol("Permission.bot.listAdmins");
  };

  static readonly user = class {
    static readonly changeName: unique symbol = Symbol("Permission.user.changeName");
  };

  static readonly game = class {
    static readonly create: unique symbol = Symbol("Permission.game.create");
    static readonly update: unique symbol = Symbol("Permission.game.update");
    static readonly remove: unique symbol = Symbol("Permission.game.remove");
    static readonly createMode: unique symbol = Symbol("Permission.game.createMode");
    static readonly removeMode: unique symbol = Symbol("Permission.game.removeMode");
  };
/*
  static readonly race = class {
    static readonly create: unique symbol = Symbol("Permission.race.create");
    static readonly remove: unique symbol = Symbol("Permission.race.remove");
    static readonly update: unique symbol = Symbol("Permission.race.update");
    static readonly createGroup: unique symbol = Symbol("Permission.race.createGroup");
    static readonly removeGroup: unique symbol = Symbol("Permission.race.removeGroup");
    static readonly updateGroup: unique symbol = Symbol("Permission.race.updateGroup");
    static readonly updateEntry: unique symbol = Symbol("Permission.race.updateEntry");
  };
  */
}
