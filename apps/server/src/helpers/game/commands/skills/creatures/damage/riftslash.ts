import { isWeapon } from '@lotr/content';
import type { ICharacter, IMacroCommandArgs, IPlayer } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class RiftSlash extends SpellCommand {
  override aliases = ['riftslash', 'cast riftslash'];
  override requiresLearn = true;
  override spellRef = 'RiftSlash';

  override range(char: ICharacter) {
    const baseRange = super.calcPlainAttackRange(char);
    return baseRange === -1 ? -1 : 4;
  }

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!args.stringArgs) return false;

    const weapon = player.items.equipment[ItemSlot.RightHand];
    if (!weapon) {
      return this.sendMessage(
        player,
        'You need a weapon in your hand to charge!',
      );
    }

    if (!isWeapon(weapon)) {
      return this.sendMessage(
        player,
        'You need a weapon in your hand to charge!',
      );
    }

    const range = this.range(player);
    if (range === -1) {
      return this.sendMessage(
        player,
        'You need to have your left hand empty to use that weapon!',
      );
    }

    this.castSpell(player, args);
  }
}
