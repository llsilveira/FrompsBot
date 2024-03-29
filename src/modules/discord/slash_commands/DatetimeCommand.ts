import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { DateTime, TimeZone } from "timezonecomplete";
import FrompsBotError from "../../../errors/FrompsBotError";
import ApplicationCommand from "../interaction/ApplicationCommand";
import parseDate from "../../../helpers/parseDate";
import parseTime from "../../../helpers/parseTime";
import TimezoneAutocompleteField from "../autocomplete_fields/TimezoneAutocompleteField";
import Discord from "../../Discord";


function datetimeToString(datetime: DateTime, {
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

export default class DatetimeCommand extends ApplicationCommand {
  constructor(discord: Discord) {
    super(
      "datetime",
      "Funções utilitárias de data e hora.",
      { annonymous: true }
    );

    this.#timezoneField = new TimezoneAutocompleteField(this, "timezone");
    this.#firstTimezoneField = new TimezoneAutocompleteField(this, "timezone1");
    this.#secondTimezoneField = new TimezoneAutocompleteField(this, "timezone2");

    discord.registerInteractionHandler(this.#timezoneField);
    discord.registerInteractionHandler(this.#firstTimezoneField);
    discord.registerInteractionHandler(this.#secondTimezoneField);

    this.builder.addSubcommand(subcommand => {
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
        );

      this.#timezoneField.addTo(
        subcommand, "Fuso horário (Padrão: America/Sao_Paulo).", false
      );

      return subcommand;
    });

    this.builder.addSubcommand(subcommand => {
      subcommand.setName("convert")
        .setDescription("Converte hora de um fuso horário para outro.")
        .addStringOption(option =>
          option.setName("date")
            .setDescription("Data no formato 'dd/mm/aaaa'.")
        )
        .addStringOption(option =>
          option.setName("time")
            .setDescription("Horário no formato 'HH:MM:SS'.")
        );

      this.#firstTimezoneField.addTo(
        subcommand,
        "Fuso horário de origem (Padrão: America/Sao_Paulo).",
        false
      );

      this.#secondTimezoneField.addTo(
        subcommand,
        "Fuso horário de destino (Padrão: America/Sao_Paulo).",
        false
      );

      return subcommand;
    });
  }

  async handleInteraction(
    interaction: ChatInputCommandInteraction
  ) {
    const command = interaction.options.getSubcommand();
    switch (command) {
    case "localtime": {
      const date = this._getDateField("date", interaction);
      const time = this._getTimeField("time", interaction);
      const timezone = this.#timezoneField.getValue(interaction);

      let dt;
      try {
        if (date && time) {
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
        } else {
          throw new Error();
        }
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

      const timezone1 = this.#firstTimezoneField.getValue(interaction);
      const timezone2 = this.#secondTimezoneField.getValue(interaction);

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
          name: (dt1.zone() as TimeZone).name(),
          value: `\`${datetimeToString(dt1, { date: showDate })}\``
        }, {
          name: (dt2.zone() as TimeZone).name(),
          value: `\`${datetimeToString(dt2, { date: showDate })}\``
        }]);

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
    }
  }

  _getDateField(
    fieldName: string,
    interaction: ChatInputCommandInteraction
  ) {
    const dateField = interaction.options.getString(fieldName);
    if (!dateField) { return null; }

    const dateVal = parseDate(dateField);
    if (!dateVal) {
      throw new FrompsBotError(`Data inválida: '${dateField}'.`);
    }
    return dateVal;
  }

  _getTimeField(
    fieldName: string,
    interaction: ChatInputCommandInteraction
  ) {
    const timeField = interaction.options.getString(fieldName);
    if (!timeField) { return null; }

    const timeVal = parseTime(timeField);
    if (!timeVal) {
      throw new FrompsBotError(`Horário inválido: '${timeField}'.`);
    }
    return timeVal;
  }

  #timezoneField;
  #firstTimezoneField;
  #secondTimezoneField;
}
