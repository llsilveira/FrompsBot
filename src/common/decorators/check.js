"use strict";

module.exports = check;

const { CheckError } = require("@frompsbot/common/errors");

function check(callback, paramMapper = (args) => args) {
  return function check_decorator(target, key, descriptor) {
    const { value: original } = descriptor;

    async function check_wrapper(...args) {
      await doCheck(callback, paramMapper(args, this));
      return original.apply(this, args);
    }

    return {
      ...descriptor,
      value: check_wrapper
    };
  };
}

check.all = function(...conditions) {
  return check(
    checkAllCallback(conditions), (args, thisArg) => [args, thisArg]
  );
};

check.any = function(...conditions) {
  return check(
    checkAnyCallback(conditions), (args, thisArg) => [args, thisArg]
  );
};

async function doCheck(condition, parameters) {
  const value = await condition(...parameters);
  if (!value) {
    throw new CheckError(`Check failed: ${condition.name}`);
  }
}

function checkAllCallback(conditions) {
  return async function(args, thisArg) {
    for (const conditionSpec of conditions) {
      if (Array.isArray(conditionSpec)) {
        await doCheck(conditionSpec[0], conditionSpec[1](args, thisArg));
      } else {
        await doCheck(conditionSpec, args);
      }
    }
    return true;
  };
}

function checkAnyCallback(conditions) {
  return async function(args, thisArg) {
    let first;
    for (const conditionSpec of conditions) {
      try {
        if (Array.isArray(conditionSpec)) {
          await doCheck(conditionSpec[0], conditionSpec[1](args, thisArg));
        } else {
          await doCheck(conditionSpec, args);
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
