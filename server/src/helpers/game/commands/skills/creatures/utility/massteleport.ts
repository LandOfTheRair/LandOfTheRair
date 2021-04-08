import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class MassTeleport extends SpellCommand {

  override aliases = ['massteleport', 'cast massteleport'];
  override requiresLearn = true;
  override spellRef = 'MassTeleport';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

}
