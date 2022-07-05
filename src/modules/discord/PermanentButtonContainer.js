"use strict";

module.exports = class PermanentButtonContainer {
  constructor(prefix = "pbc", separator = "$") {
    this.#prefix = prefix;
    this.#separator = separator;
    this.#registry = new Map();

    this.#escapeRegex = new RegExp(`[${this.#separator}\\\\]`, "g");
    this.#customIdPrefix = this.#escape(this.#prefix) + this.#separator;
  }

  register(name, button) {
    this.#registry.set(name, button);
  }

  unregister(name) {
    return this.#registry.delete(name);
  }

  createButton(name, args = []) {
    const button = this.#registry.get(name);
    if (!button) {
      throw new Error(`No button registered with the name '${name}'`);
    }

    const customId = this.generateCustomId(name, args);
    return button.create(customId);
  }

  resolve(interaction) {
    const customId = interaction.customId;
    if (typeof customId !== "string") { return; }
    if (!customId.startsWith(this.#customIdPrefix)) { return; }

    const data = this.parseCustomId(customId);
    const button = this.#registry.get(data.name);
    return {
      button,
      args: data.args
    };
  }

  generateCustomId(name, args) {
    return this.#joinValues([this.#prefix, name, ...args]);
  }

  parseCustomId(customId) {
    const values = this.#splitValues(customId);
    return {
      prefix: values[0],
      name: values[1],
      args: values.slice(2)
    };
  }

  #escape(str) {
    return str.replaceAll(this.#escapeRegex, "\\$&");
  }

  #joinValues(args) {
    const escapedArgs = args.map(
      arg => this.#escape(arg)
    );
    return escapedArgs.join(this.#separator);
  }

  #splitValues(str) {
    const values = [];
    let current = "";
    let index = 0;
    while (index < str.length) {
      const c = str.charAt(index);
      switch (str.charAt(index)) {
      case this.#separator: {
        values.push(current);
        current = "";
        break;
      }
      case "\\": {
        index;
        if (index + 1 < str.length) {
          const next = str.charAt(index + 1);
          if (next === "\\" || next === this.#separator) {
            current += next;
            index += 1;
          } else {
            current += "\\";
          }
        } else {
          current += "\\";
        }
        break;
      }
      default: {
        current += c;
      }
      }
      index += 1;
    }

    values.push(current);
    return values;
  }

  #prefix;
  #separator;
  #customIdPrefix;
  #registry;
  #escapeRegex;
};
