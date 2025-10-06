import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer } from '@lotr/interfaces';
import {
  ItemSlot,
} from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Cleave extends SpellCommand {
  override aliases = ['cleave', 'art cleave'];
  override requiresLearn = true;
  override spellRef = 'Cleave';

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
