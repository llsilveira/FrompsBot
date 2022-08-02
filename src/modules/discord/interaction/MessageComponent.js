"use strict";

const { InteractionType } = require("discord.js");
const InteractionHandlerBase = require("./InteractionHandlerBase");

const CUSTOMID_PREFIX = "mcomp";
const FIELD_SEPARATOR = "$";

module.exports = class MessageComponent extends InteractionHandlerBase {

  static getComponentNameFromCustomId(customId) {
    const prefix = CUSTOMID_PREFIX + FIELD_SEPARATOR;

    if (!customId.startsWith(prefix)) { return null; }

    const separatorIndex =
      customId.substring(prefix.length).indexOf(FIELD_SEPARATOR);

    if (separatorIndex < 0) { return null; }

    return customId.substring(prefix.length, prefix.length + separatorIndex);
  }

  constructor(componentName, options = {}) {
    super(InteractionType.MessageComponent, options);

    if (componentName.indexOf(FIELD_SEPARATOR) >= 0) {
      throw new Error(
        `componentName cannot contain the field separator '${FIELD_SEPARATOR}'.`
      );
    }

    this.#componentName = componentName;
  }

  get componentName() {
    return this.#componentName;
  }

  generateCustomId(args) {
    const argsStr = (args === undefined) ? "" : JSON.stringify(args);

    const value =
      CUSTOMID_PREFIX + FIELD_SEPARATOR +
      this.#componentName + FIELD_SEPARATOR +
      argsStr;

    if (value.length > 100) {
      throw new Error("generated customId is more than 100 characters long.");
    }

    return value;
  }

  getArguments(customId) {
    const index = CUSTOMID_PREFIX.length + FIELD_SEPARATOR.length +
      this.componentName.length + FIELD_SEPARATOR.length;

    const argsStr = customId.substring(index);
    if (argsStr.length <= 0) { return null; }

    return JSON.parse(argsStr);
  }

  // abstract method handleInteraction is not implemented.

  #componentName;
};
