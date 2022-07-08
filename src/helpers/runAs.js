"use strict";

module.exports = function runAs(app, user, callback, ...args) {
  return app.context.run(() => {
    app.services.auth.login(user);
    return callback(...args);
  });
};
