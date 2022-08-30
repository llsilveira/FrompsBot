import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { TzDatabase, TimeZone } from "timezonecomplete";
import FrompsBotError from "../../../errors/FrompsBotError";
import ApplicationCommand from "../interaction/ApplicationCommand";
import AutocompleteField, { AutocompleteFieldParent } from "../interaction/AutocompleteField";
import { InteractionHandlerOptions } from "../interaction/InteractionHandler";

export default class TimezoneAutocompleteField extends AutocompleteField {
  readonly timezones: {
    [key: string]: string
  };

  constructor(
    command: ApplicationCommand,
    fieldName: string,
    options: InteractionHandlerOptions = {}) {
    super(command.commandName, fieldName, options);

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

  async handleInteraction(
    interaction: AutocompleteInteraction
  ) {
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

  addTo<T extends AutocompleteFieldParent>(
    builder: T,
    description: string,
    isRequired: boolean = false
  ) {
    builder.addStringOption(option =>
      option.setName(this.fieldName)
        .setDescription(description)
        .setRequired(isRequired)
        .setAutocomplete(true)
    );
  }

  getValue(
    interaction: AutocompleteInteraction | ChatInputCommandInteraction
  ) {
    let timezoneField = interaction.options.getString(this.fieldName);

    let timezoneVal;
    if (typeof timezoneField !== "string" || timezoneField.length === 0) {
      timezoneField = "America/Sao_Paulo";
    }
    try {
      timezoneVal = TimeZone.zone(timezoneField);
    } catch (e) {
      throw new FrompsBotError("Fuso horário desconhecido!");
    }
    return timezoneVal;
  }
}
