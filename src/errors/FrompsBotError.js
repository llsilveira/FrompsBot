"use strict";


module.exports = class FrompsBotError extends Error {
  constructor(message, ...options) {
    super(message, ...options);
    this.name = this.constructor.name;
  }
};
