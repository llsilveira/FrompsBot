"use strict";

module.exports = check;

const { CheckError } = require("@frompsbot/common/errors");

function check(callback, paramMapper = (args) => args) {
  return function check_decorator(target, key, descriptor) {
    const { value: original } = descriptor;

    async function check_wrapper(...args) {
      await doCheck(callback, this, paramMapper(args));
      return original.apply(this, args);
    }

    return {
      ...descriptor,
      value: check_wrapper
    };
  };
}

check.all = function(...conditions) {
  return check(checkAllCallback(conditions));
};

check.any = function(...conditions) {
  return check(checkAnyCallback(conditions));
};

async function doCheck(condition, thisArg, parameters) {
  const value = await condition(thisArg, ...parameters);
  if (!value) {
    throw new CheckError(`Check failed: ${condition.name}`);
  }
}

function checkAllCallback(conditions) {
  return async function(thisArg, ...args) {
    for (const conditionSpec of conditions) {
      if (Array.isArray(conditionSpec)) {
        await doCheck(conditionSpec[0], thisArg, conditionSpec[1](args));
      } else {
        await doCheck(conditionSpec, thisArg, args);
      }
    }
    return true;
  };
}

function checkAnyCallback(conditions) {
  return async function(thisArg, ...args) {
    let first;
    for (const conditionSpec of conditions) {
      try {
        if (Array.isArray(conditionSpec)) {
          await doCheck(conditionSpec[0], thisArg, conditionSpec[1](args));
        } else {
          await doCheck(conditionSpec, thisArg, args);
        }
        return true;
      } catch (e) {
        if (!(e instanceof CheckError)) { throw e; }
        if (!first) { first = e; }
      }
    }
    throw first;
  };
}
