"use strict";

module.exports = check;

const { CheckError } = require("@frompsbot/common/errors");

function check(constraint, paramMapper = (args) => args) {
  return function check_decorator(target, key, descriptor) {
    const { value: original } = descriptor;

    async function check_wrapper(...args) {
      await doCheck(constraint, this, paramMapper(args));
      return original.apply(this, args);
    }

    return {
      ...descriptor,
      value: check_wrapper
    };
  };
}

check.all = function(...constraints) {
  return check(checkAllCallback(constraints));
};

check.any = function(...constraints) {
  return check(checkAnyCallback(constraints));
};

async function doCheck(constraints, thisArg, parameters) {
  const value = await constraints(thisArg, ...parameters);
  if (!value) {
    throw new CheckError(`Check failed: ${constraints.name}`);
  }
}

function checkAllCallback(constraints) {
  return async function(thisArg, ...args) {
    for (const constraintSpec of constraints) {
      if (Array.isArray(constraintSpec)) {
        await doCheck(constraintSpec[0], thisArg, constraintSpec[1](args));
      } else {
        await doCheck(constraintSpec, thisArg, args);
      }
    }
    return true;
  };
}

function checkAnyCallback(constraints) {
  return async function(thisArg, ...args) {
    let first;
    for (const constraintSpec of constraints) {
      try {
        if (Array.isArray(constraintSpec)) {
          await doCheck(constraintSpec[0], thisArg, constraintSpec[1](args));
        } else {
          await doCheck(constraintSpec, thisArg, args);
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
