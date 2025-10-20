import { SpellCommand } from '@lotr/core';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';

export class Ragerang extends SpellCommand {
  override aliases = ['ragerang', 'art ragerang'];
  override requiresLearn = true;
  override spellRef = 'Ragerang';

  override range(char: ICharacter) {
    return this.calcPlainAttackRange(char);
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!player.items.equipment[ItemSlot.RightHand]) {
      return this.sendMessage(
        player,
        'You do not have anything in your right hand!',
      );
    }

    super.execute(player, args);
  }
}
