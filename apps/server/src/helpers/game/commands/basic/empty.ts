import { itemIsOwnedBy, itemPropertiesGet } from '@lotr/content';
import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemClass } from '@lotr/interfaces';

export class Empty extends MacroCommand {
  override aliases = ['empty'];
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) args.stringArgs = 'right';

    args.stringArgs = args.stringArgs.toLowerCase();

    if (!['right', 'left'].includes(args.stringArgs)) {
      return this.sendMessage(
        player,
        'You do not have anything to empty there!',
      );
    }

    const item = player.items.equipment[args.stringArgs + 'Hand'];
    if (!item) {
      return this.sendMessage(player, 'You do not have anything in that hand!');
    }

    const { itemClass, ounces } = itemPropertiesGet(item, [
      'itemClass',
      'ounces',
    ]);
    if (itemClass !== ItemClass.Bottle) {
      return this.sendMessage(player, 'You do not have a bottle in that hand!');
    }

    if (!itemIsOwnedBy(player, item)) {
      return this.sendMessage(player, 'That is not yours!');
    }

    if ((ounces ?? 0) <= 0) {
      return this.sendMessage(player, 'That bottle is already empty!');
    }

    item.mods.ounces = 0;
    item.mods.value = 1;
    item.mods.useEffect = null;
    item.mods.extendedDesc = '';

    this.sendMessage(
      player,
      `You empty the bottle in your ${args.stringArgs} hand.`,
    );
  }
}
