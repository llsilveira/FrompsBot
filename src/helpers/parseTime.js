"use strict";

const timeRegex = /^(\d{1,2}):(\d{1,2})(:\d{1,2})?$/;

module.exports = function parseTime(timeString) {
  const match = timeString.match(timeRegex);
  if (!match) { return null; }

  const hours = Number.parseInt(match[1]);
  const minutes = Number.parseInt(match[2]);
  const seconds = match[3] ? Number.parseInt(match[3].substring(1)) : 0;

  if (hours > 23 || minutes > 59 || seconds > 59) { return null; }
  return { hours, minutes, seconds };
};
