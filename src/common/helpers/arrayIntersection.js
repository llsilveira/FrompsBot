"use strict";

const { EnhancedSet } = require("@fromps-bot/common/types");

module.exports = function arrayIntersection(array1, array2) {
  return Array.from(
    (new EnhancedSet(array1)).intersect(new EnhancedSet(array2))
  );
};