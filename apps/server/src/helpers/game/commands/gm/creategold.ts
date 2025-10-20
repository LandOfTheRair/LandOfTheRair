import { MacroCommand } from '@lotr/core';
import type { IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { cleanNumber } from '@lotr/shared';

export class GMCreateGold extends MacroCommand {
  override aliases = ['@creategold', '@gold', '@g'];
  override isGMCommand = true;
  override canBeInstant = false;
  override canBeFast = false;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    const value = cleanNumber(args.arrayArgs[0], 0, {
      floor: true,
      abs: true,
    });
    if (!value) {
      this.sendMessage(player, 'Enter a valid amount of gold.');
      return;
    }

    const gold = this.game.itemCreator.getGold(value);
    if (!player.items.equipment[ItemSlot.RightHand]) {
      this.game.characterHelper.setRightHand(player, gold);
      this.sendMessage(player, `${value} gold added to your right hand.`);
    } else {
      this.game.worldManager
        .getMap(player.map)
        ?.state.addItemToGround(player.x, player.y, gold);
      this.sendMessage(player, `${value} gold added to ground.`);
    }
  }
}
