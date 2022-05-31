"use strict";

module.exports = function camelCase(str) {
  if (str.length === 0) { return str; }

  return str[0].toLowerCase() + str.substring(1);
};