"use strict";

const { EmbedBuilder } = require("discord.js");
const { TzDatabase, DateTime, TimeZone } = require("timezonecomplete");
const FrompsBotError = require("../../../errors/FrompsBotError");
const parseDate = require("../../../helpers/parseDate");
const parseTime = require("../../../helpers/parseTime");
const SlashCommandBase = require("../SlashCommandBase");


function datetimeToString(datetime, {
  date = true,
  timezone = false,
} = {}) {
  let format = "HH:mm:ss";
  if (date) {
    format = "dd/MM/yyyy " + format;
  }
  if (timezone) {
    format += " VV";
  }

  return datetime.format(format);
}

module.exports = class DatetimeCommand extends SlashCommandBase {
  constructor(discord) {
    super(discord, "datetime", "Funções utilitárias de data e hora.", {
      loginRequired: false
    });

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("localtime")
        .setDescription(
          "Mostra as opções de formatação de data e hora nativas do Discord."
        )
        .addStringOption(option =>
          option.setName("date")
            .setDescription("Data no formato 'dd/mm/aaaa'.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("time")
            .setDescription("Horário no formato 'HH:MM:SS'.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("timezone")
            .setDescription("Fuso horário (Padrão: America/Sao_Paulo).")
            .setAutocomplete(true)
        )
    );

    this.builder.addSubcommand(subcommand =>
      subcommand.setName("convert")
        .setDescription("Converte hora de um fuso horário para outro.")
        .addStringOption(option =>
          option.setName("date")
            .setDescription("Data no formato 'dd/mm/aaaa'.")
        )
        .addStringOption(option =>
          option.setName("time")
            .setDescription("Horário no formato 'HH:MM:SS'.")
        )
        .addStringOption(option =>
          option.setName("timezone1")
            .setDescription("Fuso horário de origem (Padrão: America/Sao_Paulo).")
            .setAutocomplete(true)
        )
        .addStringOption(option =>
          option.setName("timezone2")
            .setDescription("Fuso horário de destino (Padrão: America/Sao_Paulo).")
            .setAutocomplete(true)
        )
    );

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

  async execute(interaction) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "localtime": {
      const date = this._getDateField("date", interaction);
      const time = this._getTimeField("time", interaction);
      const timezone = this._getTimezoneField("timezone", interaction);

      let dt;
      try {
        dt = new DateTime(
          date.year,
          date.month,
          date.day,
          time.hours,
          time.minutes,
          time.seconds,
          0,
          timezone
        );
      } catch (e) {
        throw new FrompsBotError("Parâmetros inválidos!");
      }

      const dateValue = dt.valueOf() / 1000;
      const description =
        `\`<t:${dateValue}:t>\` - <t:${dateValue}:t>` +
        `\n\`<t:${dateValue}:T>\` - <t:${dateValue}:T>` +
        `\n\`<t:${dateValue}:d>\` - <t:${dateValue}:d>` +
        `\n\`<t:${dateValue}:D>\` - <t:${dateValue}:D>` +
        `\n\`<t:${dateValue}:f>\` - <t:${dateValue}:f>` +
        `\n\`<t:${dateValue}:F>\` - <t:${dateValue}:F>` +
        `\n\`<t:${dateValue}:R>\` - <t:${dateValue}:R>`;

      const embed = new EmbedBuilder()
        .setTitle(datetimeToString(dt))
        .setDescription(description);

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
      break;
    }
    case "convert": {
      let date = this._getDateField("date", interaction);
      let time = this._getTimeField("time", interaction);
      const timezone1 = this._getTimezoneField("timezone1", interaction);
      const timezone2 = this._getTimezoneField("timezone2", interaction);

      const now = DateTime.now(timezone1);
      let showDate = true;
      if (!date) {
        date = {
          day: now.day(),
          month: now.month(),
          year: now.year()
        };
        showDate = false;
      }
      if (!time) {
        time = {
          hours: now.hour(),
          minutes: now.minute(),
          seconds: now.second()
        };
      }


      let dt1;
      try {
        dt1 = new DateTime(
          date.year,
          date.month,
          date.day,
          time.hours,
          time.minutes,
          time.seconds,
          0,
          timezone1
        );
      } catch (e) {
        throw new FrompsBotError("Parâmetros inválidos!");
      }
      const dt2 = dt1.toZone(timezone2);

      const embed = new EmbedBuilder()
        .addFields([{
          name: dt1.zone().name(),
          value: `\`${datetimeToString(dt1, { date: showDate })}\``
        }, {
          name: dt2.zone().name(),
          value: `\`${datetimeToString(dt2, { date: showDate })}\``
        }]);

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
    }
  }

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const typed = focusedOption.value.toLowerCase();

    switch (focusedOption.name) {
    case "timezone":
    case "timezone1":
    case "timezone2": {
      const results = [];
      for (const [tz, tzvalue] of Object.entries(this.timezones)) {
        if (tzvalue.startsWith(typed)) {
          results.push({ name: tz, value: tz });
          if (results.length >= 25) { break; }
        }
      }

      await interaction.respond(results);
    }
    }
  }

  _getDateField(fieldName, interaction) {
    const dateField = interaction.options.getString(fieldName);
    if (!dateField) { return null; }

    const dateVal = parseDate(dateField);
    if (!dateVal) {
      throw new FrompsBotError(`Data inválida: '${dateField}'.`);
    }
    return dateVal;
  }

  _getTimeField(fieldName, interaction) {
    const timeField = interaction.options.getString(fieldName);
    if (!timeField) { return null; }

    const timeVal = parseTime(timeField);
    if (!timeVal) {
      throw new FrompsBotError(`Horário inválido: '${timeField}'.`);
    }
    return timeVal;
  }

  _getTimezoneField(fieldName, interaction) {
    let timezoneField = interaction.options.getString(fieldName);

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
