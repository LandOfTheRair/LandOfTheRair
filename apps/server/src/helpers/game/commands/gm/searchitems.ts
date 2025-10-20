import { searchItems } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { GameServerResponse } from '@lotr/interfaces';

export class GMSearchItems extends MacroCommand {
  override aliases = ['@searchitems', '@si'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    let itemName = '';
    let limit = 5;

    const [gotLimit, gotItem] = args.arrayArgs;

    if (!gotItem) {
      itemName = gotLimit;
    } else {
      limit = +gotLimit;
      itemName = args.stringArgs.substring(args.stringArgs.indexOf(' ') + 1);
    }

    if (isNaN(limit)) limit = 5;

    if (!itemName) return false;

    let items;
    try {
      items = searchItems(itemName);
    } catch (e) {
      return;
    }

    if (!items.length) {
      return this.sendMessage(
        player,
        `No items matching "${itemName}" were found.`,
      );
    }

    const introMessage = `Search results for item with name "${itemName}":`;

    const messages: string[] = [];

    for (let i = 0; i < items.length; i++) {
      if (i >= limit) {
        messages.push(`... and ${items.length - limit} more.`);
        break;
      }
      messages.push(`${i + 1}: ${items[i]}`);
    }

    const finalMessage = `${introMessage}<br><br>${messages.join('<br>')}`;

    this.sendMessage(player, finalMessage);

    args.callbacks.emit({
      type: GameServerResponse.SendAlert,
      title: introMessage,
      content: messages.join('<br>'),
    });
  }
}
