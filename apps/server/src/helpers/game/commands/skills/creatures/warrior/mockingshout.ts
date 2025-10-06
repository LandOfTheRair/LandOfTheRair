import type {
  ICharacter,
  IMacroCommandArgs,
  IPlayer } from '@lotr/interfaces';
import {
  ItemSlot,
} from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class MockingShout extends SpellCommand {
  override aliases = ['mockingshout', 'art mockingshout'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'MockingShout';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!player.items.equipment[ItemSlot.RightHand]) {
return this.sendMessage(
        player,
        'You need a weapon in your hands to provoke someone!',
      );
}

    this.castSpellAt(player, player, args);
  }

  override use(char: ICharacter) {
    this.castSpellAt(char, char);
  }
}
