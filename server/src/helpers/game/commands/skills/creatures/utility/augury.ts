import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Augury extends SpellCommand {

  override aliases = ['augury', 'cast augury'];
  override requiresLearn = true;
  override spellRef = 'Augury';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

}
