import {
  ButtonBuilder, ButtonStyle, ActionRowBuilder, SelectMenuBuilder,
  MessageComponentInteraction, SelectMenuInteraction, MessageActionRowComponentBuilder
} from "discord.js";

import ContextManager from "../../../core/modules/ContextManager";
import { JSONSerializable } from "../../../core/type";
import { InteractionHandlerOptions } from "../interaction/InteractionHandler";
import MessageComponent from "../interaction/MessageComponent";


export type PaginatorUpdateMessageCallback = (
  interaction: MessageComponentInteraction,
  context: ContextManager,
  pageSize: number,
  page: number,
  extraParams?: JSONSerializable
) => unknown;

type PaginatorArguments = [string, number, number, number, JSONSerializable?];

const MAX_SELECT_OPTIONS = 11;

export default class MessagePaginator extends MessageComponent {
  constructor(
    componentName: string,
    updateMessageCallback: PaginatorUpdateMessageCallback,
    options: InteractionHandlerOptions = {}
  ) {
    super(componentName, options);
    this.#updateMessageCallback = updateMessageCallback;
  }

  async handleInteraction(
    interaction: MessageComponentInteraction,
    context: ContextManager
  ) {
    const [op, currentPage, pageSize, pageCount, extra] =
      this.getArguments(interaction.customId) as PaginatorArguments;

    let page = 1;

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
      const newPage = Number.parseInt((interaction as SelectMenuInteraction).values[0]);
      if (newPage > 0) { page = newPage; }
      break;
    }
    }

    await this.#updateMessageCallback(
      interaction, context, pageSize, page, extra
    );
  }

  getButtons(
    pageSize: number,
    pageNumber: number,
    pageCount: number,
    extra?: JSONSerializable
  ) {

    const firstButton = this.#createButton(this.#generateId(
      ["first", pageNumber, pageSize, pageCount, extra]
    ));
    firstButton.setEmoji("⏮");
    if (pageNumber === 1) {
      firstButton.setDisabled(true);
    }

    const prevButton = this.#createButton(this.#generateId(
      ["prev", pageNumber, pageSize, pageCount, extra]
    ));
    prevButton.setEmoji("◀");
    if (pageNumber === 1) {
      prevButton.setDisabled(true);
    }

    const nextButton = this.#createButton(this.#generateId(
      ["next", pageNumber, pageSize, pageCount, extra]
    ));
    nextButton.setEmoji("▶");
    if (pageNumber === pageCount) {
      nextButton.setDisabled(true);
    }

    const lastButton = this.#createButton(this.#generateId(
      ["last", pageNumber, pageSize, pageCount, extra]
    ));
    lastButton.setEmoji("⏭");
    if (pageNumber === pageCount) {
      lastButton.setDisabled(true);
    }

    const pageCountButton = this.#createButton(this.#generateId());
    pageCountButton.setLabel(`Página ${pageNumber}/${pageCount}`).setDisabled(true);
    pageCountButton.setStyle(ButtonStyle.Secondary);

    const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
      firstButton, prevButton, pageCountButton, nextButton, lastButton
    ]);

    return actionRow;
  }

  getPageSelector(
    pageSize: number,
    pageNumber: number,
    pageCount: number,
    extra?: JSONSerializable
  ) {
    const pageSelector = this.#createSelectMenu(this.#generateId(
      ["select", pageNumber, pageSize, pageCount, extra]
    ), pageNumber, pageCount);

    const actionRow = new ActionRowBuilder()
      .addComponents([pageSelector]);

    return actionRow;
  }

  #generateId(args?: PaginatorArguments) {
    if (!args) { return this.generateCustomId(); }
    const [op, currentPage, pageSize, pageCount, extra] = args;
    if (extra) {
      return this.generateCustomId(
        [op, currentPage, pageSize, pageCount, extra]
      );
    }
    return this.generateCustomId([op, currentPage, pageSize, pageCount]);
  }

  #createButton(customId: string) {
    const button = new ButtonBuilder().setStyle(ButtonStyle.Primary)
      .setCustomId(customId);
    return button;
  }

  #createSelectMenu(
    customId: string,
    pageNumber: number,
    pageCount: number
  ) {
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
}
