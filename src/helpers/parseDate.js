"use strict";

const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/;

module.exports = function parseDate(dateString, { monthFirst = false } = {}) {
  const match = dateString.match(dateRegex);
  if (!match) { return null; }

  const day = Number.parseInt(monthFirst ? match[2] : match[1]);
  const month = Number.parseInt(monthFirst ? match[1] : match[2]);
  let year = Number.parseInt(match[3]);
  if (day == 0 || month == 0 || year == 0) {
    return null;
  }

  // Year was represented by only 2 numbers
  if (match[3].length < 3) { year = (year >= 70 ? year + 1900 : year + 2000); }

  return { day, month, year };
};
