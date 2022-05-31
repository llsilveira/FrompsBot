"use strict";


module.exports = function transactional(
  getApp = (obj) => obj.app
) {
  return function transactional_decorator(target, key, descriptor) {
    const original = descriptor.value;

    function transactional_wrapper(...args) {
      const app = getApp(this);
      const db = app.container.resolve("db");
      return db.withTransaction(original.bind(this), ...args);
    }

    return {
      ...descriptor,
      value: transactional_wrapper
    };
  };
};
