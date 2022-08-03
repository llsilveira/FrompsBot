"use strict";

const { ButtonBuilder, ButtonStyle, ActionRowBuilder, SelectMenuBuilder } = require("discord.js");
const MessageComponent = require("../interaction/MessageComponent");

const MAX_SELECT_OPTIONS = 11;

module.exports = class MessagePaginator extends MessageComponent {
  constructor(componentName, updateMessageCallback, options = {}) {
    super(componentName, options);
    this.#updateMessageCallback = updateMessageCallback;
  }

  async handleInteraction(interaction, context) {
    const [op, currentPage, pageSize, pageCount, ...extraParams] =
      this.getArguments(interaction.customId);

    let page;

    switch (op) {
    case "next": {
      page = currentPage + 1;
      break;
    }
    case "prev": {
      page = currentPage - 1;
      break;
    }
    case "last": {
      page = pageCount;
      break;
    }
    case "first": {
      page = 1;
      break;
    }
    case "select": {
      const newPage = Number.parseInt(interaction.values[0]);
      if (newPage > 0) { page = newPage; }
      break;
    }
    }

    await this.#updateMessageCallback(
      interaction, context, pageSize, page, ...extraParams
    );
  }

  getButtons(pageSize, pageNumber, pageCount, ...extra) {

    const firstButton = this.#createButton(this.generateCustomId(
      ["first", pageNumber, pageSize, pageCount, ...extra]
    ));
    firstButton.setEmoji("⏮");
    if (pageNumber === 1) {
      firstButton.setDisabled(true);
    }

    const prevButton = this.#createButton(this.generateCustomId(
      ["prev", pageNumber, pageSize, pageCount, ...extra]
    ));
    prevButton.setEmoji("◀");
    if (pageNumber === 1) {
      prevButton.setDisabled(true);
    }

    const nextButton = this.#createButton(this.generateCustomId(
      ["next", pageNumber, pageSize, pageCount, ...extra]
    ));
    nextButton.setEmoji("▶");
    if (pageNumber === pageCount) {
      nextButton.setDisabled(true);
    }

    const lastButton = this.#createButton(this.generateCustomId(
      ["last", pageNumber, pageSize, pageCount, ...extra]
    ));
    lastButton.setEmoji("⏭");
    if (pageNumber === pageCount) {
      lastButton.setDisabled(true);
    }

    const pageCountButton = this.#createButton(this.generateCustomId());
    pageCountButton.setLabel(`Página ${pageNumber}/${pageCount}`).setDisabled(true);
    pageCountButton.setStyle(ButtonStyle.Secondary);

    const actionRow = new ActionRowBuilder().addComponents([
      firstButton, prevButton, pageCountButton, nextButton, lastButton
    ]);

    return actionRow;
  }

  getPageSelector(pageSize, pageNumber, pageCount, ...extra) {
    const pageSelector = this.#createSelectMenu(this.generateCustomId(
      ["select", pageNumber, pageSize, pageCount, ...extra]
    ), pageNumber, pageCount);

    const actionRow = new ActionRowBuilder()
      .addComponents([pageSelector]);

    return actionRow;
  }

  #createButton(customId) {
    const button = new ButtonBuilder().setStyle(ButtonStyle.Primary)
      .setCustomId(customId);
    return button;
  }

  #createSelectMenu(customId, pageNumber, pageCount) {
    let pagesBefore = pageNumber - 1;
    let pagesAfter = pageCount - pageNumber;

    if (pageCount > MAX_SELECT_OPTIONS) {
      const halfPages = (MAX_SELECT_OPTIONS - 1) / 2;
      if (pagesAfter >= halfPages && pagesBefore >= halfPages) {
        pagesAfter = pagesBefore = halfPages;
      } else if (pagesAfter >= halfPages) {
        pagesAfter = Math.min(pagesAfter, MAX_SELECT_OPTIONS - 1 - pagesBefore);
      } else {
        pagesBefore = Math.min(pagesBefore, MAX_SELECT_OPTIONS - 1 - pagesAfter);
      }
    }

    const values = [];

    let page = pageNumber - pagesBefore;
    if (pageNumber !== 1) {
      values.push({ label: "Página 1", value: "1" });
      page++;
    }

    if (page !== pageNumber && page > 2) {
      values.push({ label: "--", value: "-1" });
      page++;
    }

    while (page < pageNumber) {
      values.push({ label: `Página ${page}`, value: page.toString() });
      page++;
    }

    values.push({
      label: `Página ${pageNumber}`,
      value: pageNumber.toString(),
      default: true
    });
    page++;

    while (page <= pageNumber + pagesAfter - 2) {
      values.push({ label: `Página ${page}`, value: page.toString() });
      page++;
    }

    if (page < pageCount - 1) {
      values.push({ label: "--", value: "-2" });
    } else if (page < pageCount) {
      values.push({ label: `Página ${page}`, value: page.toString() });
    }

    if (pageNumber !== pageCount) {
      values.push({ label: `Página ${pageCount}`, value: pageCount.toString() });
    }


    const selectMenu = new SelectMenuBuilder()
      .setCustomId(customId)
      .setOptions(values);
    return selectMenu;
  }

  #updateMessageCallback;
};
