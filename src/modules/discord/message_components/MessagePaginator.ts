import {
  ButtonBuilder, ButtonStyle, ActionRowBuilder, SelectMenuBuilder,
  MessageComponentInteraction, SelectMenuInteraction, MessageActionRowComponentBuilder
} from "discord.js";

import ContextManager from "../../ContextManager";
import { JSONSerializable } from "../../../app/core/type";
import { InteractionHandlerOptions } from "../interaction/InteractionHandler";
import MessageComponent from "../interaction/MessageComponent";


export type PaginatorUpdateMessageCallback<
  T extends JSONSerializable | undefined = undefined
> = (
  interaction: MessageComponentInteraction,
  context: ContextManager,
  pageSize: number,
  pageNumber: number,
  extra: T
) => unknown;

type TypeSelector = "select" | "first" | "last" | "prev" | "next";


type UndefinedArguments = [TypeSelector, number, number, number]
type NonUndefinedArguments<T extends JSONSerializable> =
  [TypeSelector, number, number, number, T]

type PaginatorArguments<T extends JSONSerializable | undefined = undefined> =
  T extends undefined ? UndefinedArguments :
  T extends JSONSerializable ? NonUndefinedArguments<T> :
    NonUndefinedArguments<Exclude<T, undefined>> | UndefinedArguments;


const MAX_SELECT_OPTIONS = 11;

export default class MessagePaginator<T extends JSONSerializable | undefined>
  extends MessageComponent<PaginatorArguments<T>> {
  constructor(
    componentName: string,
    updateMessageCallback: PaginatorUpdateMessageCallback<T>,
    options: InteractionHandlerOptions = {}
  ) {
    super(componentName, options);
    this.updateMessageCallback = updateMessageCallback;
  }

  async handleInteraction(
    interaction: MessageComponentInteraction,
    context: ContextManager
  ) {
    const args = this.getArguments(interaction.customId);
    const [op, pageSize, pageNumber, pageCount, extra] = args;

    let page = 1;

    switch (op) {
    case "next": {
      page = pageNumber + 1;
      break;
    }
    case "prev": {
      page = pageNumber - 1;
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
    default: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustiveCheck: never = op;
      throw new Error("Unhandled operation");
    }
    }

    await this.updateMessageCallback(
      interaction, context, pageSize, page, extra as T
    );
  }

  getButtons(
    pageSize: number,
    pageNumber: number,
    pageCount: number,
    extra: T
  ) {
    const firstButton = this.#createButton(this.#generateId(
      "first", pageSize, pageNumber, pageCount, extra
    ));
    firstButton.setEmoji("⏮");
    if (pageNumber === 1) {
      firstButton.setDisabled(true);
    }

    const prevButton = this.#createButton(this.#generateId(
      "prev", pageSize, pageNumber, pageCount, extra
    ));
    prevButton.setEmoji("◀");
    if (pageNumber === 1) {
      prevButton.setDisabled(true);
    }

    const nextButton = this.#createButton(this.#generateId(
      "next", pageSize, pageNumber, pageCount, extra
    ));
    nextButton.setEmoji("▶");
    if (pageNumber === pageCount) {
      nextButton.setDisabled(true);
    }

    const lastButton = this.#createButton(this.#generateId(
      "last", pageSize, pageNumber, pageCount, extra
    ));
    lastButton.setEmoji("⏭");
    if (pageNumber === pageCount) {
      lastButton.setDisabled(true);
    }

    const pageCountButton = this.#createButton("dummy");
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
    extra: T
  ) {
    const pageSelector = this.#createSelectMenu(this.#generateId(
      "select", pageSize, pageNumber, pageCount, extra
    ), pageNumber, pageCount);

    const actionRow = new ActionRowBuilder()
      .addComponents([pageSelector]);

    return actionRow;
  }

  #generateId(
    op: TypeSelector,
    pageSize: number,
    pageNumber: number,
    pageCount: number,
    extra: T
  ) {
    if (extra === undefined) {
      return this.generateCustomId(
        [op, pageSize, pageNumber, pageCount] as PaginatorArguments<T>
      );
    }
    return this.generateCustomId(
      [op, pageSize, pageNumber, pageCount, extra] as PaginatorArguments<T>
    );
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

  private readonly updateMessageCallback: PaginatorUpdateMessageCallback<T>;
}
