"use strict";

module.exports = function isIterable(obj) {
  if (obj == null) return false;
  return typeof (obj[Symbol.iterator]) === "function";
};
