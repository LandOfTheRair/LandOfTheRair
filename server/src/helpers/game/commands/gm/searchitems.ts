import { IMacroCommandArgs, IPlayer } from '../../../../interfaces';
import { MacroCommand } from '../../../../models/macro';

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
      items = this.game.itemHelper.searchItems(itemName);
    } catch (e) {
      return;
    }

    if (!items.length) return this.sendMessage(player, `No items matching "${itemName}" were found.`);

    this.sendMessage(player, `Search results for item with name "${itemName}":`);
    for (let i = 0; i < items.length; i++) {
      if (i >= limit) {
        this.sendMessage(player, `... and ${items.length - limit} more.`);
        return;
      }
      this.sendMessage(player, `${i + 1}: ${items[i]}`);
    }

  }
}
