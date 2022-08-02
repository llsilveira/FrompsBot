"use strict";

const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const MessageComponent = require("../interaction/MessageComponent");

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
    }

    await this.#updateMessageCallback(
      interaction, context, pageSize, page, ...extraParams
    );
  }

  createActionRow(pageSize, pageNumber, pageCount, ...extra) {

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
    pageCountButton.setLabel(`${pageNumber}/${pageCount}`).setDisabled(true);

    const actionRow = new ActionRowBuilder();
    actionRow.addComponents([
      firstButton, prevButton, pageCountButton, nextButton, lastButton
    ]);

    return actionRow;
  }

  #createButton(customId) {
    const button = new ButtonBuilder().setStyle(ButtonStyle.Primary)
      .setCustomId(customId);
    return button;
  }

  #updateMessageCallback;
};
