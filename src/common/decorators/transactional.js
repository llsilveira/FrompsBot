"use strict";


module.exports = function transactional(getDatabase = (obj) => obj.app.db) {
  return function transactional_decorator(target, key, descriptor) {
    const original = descriptor.value;

    function transactional_wrapper(...args) {
      return getDatabase(this).withTransaction(original.bind(this), ...args);
    }

    return {
      ...descriptor,
      value: transactional_wrapper
    };
  };
};
