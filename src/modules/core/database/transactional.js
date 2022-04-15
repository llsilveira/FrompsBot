"use strict";


module.exports = function transactional(getDatabase = (obj) => obj.db) {
  return function decorator(target, key, descriptor) {
    const original = descriptor.value;

    function wrapper(...args) {
      return getDatabase(this).withTransaction(original.bind(this), ...args);
    }

    return {
      ...descriptor,
      value: wrapper
    };
  };
};
