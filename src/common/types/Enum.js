"use strict";

const { isIterable, namedPropertyIterator } = require("@frompsbot/common/helpers");

module.exports = class Enum {

  static values() {
    return Object.values(this);
  }

  static names() {
    return this.values().map((v) => v.name);
  }

  static fromString(name) {
    const value = this[name];
    if (value) return value;

    throw new RangeError(`No instance of ${this.name} exists with the name ${name}.`);
  }

  constructor(name, props = {}) {
    this.name = name;

    const iterator = isIterable(props) ?
      props[Symbol.iterator]() : namedPropertyIterator(props);
    for (const [k, v] of iterator) {
      this[k] = v;
    }

    Object.freeze(this);
  }
};
