import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Vortex extends SpellCommand {

  override aliases = ['vortex', 'cast vortex'];
  override requiresLearn = true;
  override spellRef = 'Vortex';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

}
