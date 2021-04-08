import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Teleport extends SpellCommand {

  override aliases = ['teleport', 'cast teleport'];
  override requiresLearn = true;
  override spellRef = 'Teleport';
  override canTargetSelf = true;

  override execute(player: IPlayer, args: IMacroCommandArgs) {
    this.castSpellAt(player, player, args);
  }

}
