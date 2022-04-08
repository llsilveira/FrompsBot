"use strict";

const path = require("path");
const fs = require("fs");


/**
 * Loads all the javascript files inside a path, ignoring some files if needed.
 *  This is used mainly for the purpose of re-exporting submodules from an
 *  index.js file.
 *
 * @param {string} loadPath - Path for the files to be loaded.
 * @param {Object} options - An object with options to the function.
 * @param {Array[string]} options.ignore - List of filenames to ignore. The
 * names included here must not contain any path prepended to them.
 * @param {boolean} options.ignoreIndex - Ignore the 'index.js' file.
 *
 * @return {object} - An object with the loaded modules with the filenames
 * without the ".js" extension as keys.
 */
module.exports = function pathLoad(
  loadPath, {
    ignore = [],
    ignoreIndex = true
  } = {}
) {
  if (ignoreIndex && !ignore.includes("index.js")) {
    ignore.push("index.js");
  }
  const files = fs.readdirSync(loadPath).filter(file => {
    return file.endsWith(".js") && !ignore.includes(file);
  });
  const exported = {};
  files.forEach(file => {
    const filename = path.resolve(loadPath, file);
    exported[file.slice(0, -3)] = require(filename);
  });
  return exported;
};
