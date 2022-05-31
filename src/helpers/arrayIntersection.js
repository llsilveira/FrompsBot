"use strict";

const { EnhancedSet } = require("../types");

module.exports = function arrayIntersection(array1, array2) {
  return Array.from(
    (new EnhancedSet(array1)).intersection(new EnhancedSet(array2))
  );
};
