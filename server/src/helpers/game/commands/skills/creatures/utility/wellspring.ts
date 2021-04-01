import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Wellspring extends SpellCommand {

  aliases = ['wellspring', 'cast wellspring'];
  requiresLearn = true;
  spellRef = 'Wellspring';
  canTargetSelf = true;

}
