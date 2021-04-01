import { IMacroCommandArgs, IPlayer } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Identify extends SpellCommand {

  aliases = ['identify', 'cast identify'];
  requiresLearn = true;
  spellRef = 'Identify';
  canTargetSelf = true;

}
