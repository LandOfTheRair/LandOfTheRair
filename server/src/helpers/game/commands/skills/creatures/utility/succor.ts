import { SpellCommand } from '../../../../../../models/macro';

export class Succor extends SpellCommand {

  aliases = ['succor', 'cast succor'];
  requiresLearn = true;
  spellRef = 'Succor';
  canTargetSelf = true;

}
