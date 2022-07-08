"use strict";

const runAs = require("./runAs");

module.exports = async function runAsBot(app, callback, ...args) {
  const botUser = await app.services.user.getFromId(1);
  return runAs(app, botUser, callback, ...args);
};
