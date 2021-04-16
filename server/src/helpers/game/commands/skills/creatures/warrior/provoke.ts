import { IMacroCommandArgs, IPlayer, ItemSlot } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Provoke extends SpellCommand {

  override aliases = ['provoke', 'art provoke'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Provoke';

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    if (!player.items.equipment[ItemSlot.RightHand]) return this.sendMessage(player, 'You need a weapon in your hands to provoke someone!');

    super.execute(player, args);
  }

}
