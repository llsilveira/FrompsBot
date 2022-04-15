"use strict";

module.exports = function* namedPropertyIterator(obj) {
  for (const k in obj) yield [k, obj[k]];
};
