"use strict";

const { TzDatabase, TimeZone } = require("timezonecomplete");
const FrompsBotError = require("../../../errors/FrompsBotError");
const AutocompleteField = require("../interaction/AutocompleteField");

module.exports = class TimezoneAutocompleteField extends AutocompleteField {
  constructor(command, fieldName, options = {}) {
    const optionsCombined = Object.assign({ annonymous: true }, options);
    super(command.commandName, fieldName, optionsCombined);

    const preferredZones = [
      "America/Sao_Paulo",
      "Europe/Madrid"
    ];
    const allZones = Array.from(TzDatabase.instance().zoneNames());
    const zonesCombined = preferredZones.concat(allZones.filter(
      name => !preferredZones.includes(name)
    ));


    this.timezones = {};
    zonesCombined.forEach(
      zoneName => this.timezones[zoneName] = zoneName.toLowerCase()
    );
  }

  async handleInteraction(interaction) {
    const typed = interaction.options.getFocused();
    const results = [];
    for (const [tz, tzvalue] of Object.entries(this.timezones)) {
      if (tzvalue.indexOf(typed.toLowerCase()) >= 0) {
        results.push({ name: tz, value: tz });
        if (results.length >= 25) { break; }
      }
    }

    await interaction.respond(results);
  }

  addTo(builder, description, isRequired = false) {
    builder.addStringOption(option =>
      option.setName(this.fieldName)
        .setDescription(description)
        .setRequired(isRequired)
        .setAutocomplete(true)
    );
  }

  async getValue(interaction) {
    let timezoneField = interaction.options.getString(this.fieldName);

    let timezoneVal;
    if (typeof timezoneField !== typeof "" || timezoneField.length === 0) {
      timezoneField = "America/Sao_Paulo";
    }
    try {
      timezoneVal = TimeZone.zone(timezoneField);
    } catch (e) {
      throw new FrompsBotError("Fuso horário desconhecido!");
    }
    return timezoneVal;
  }
};
