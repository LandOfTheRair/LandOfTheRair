import { SpellCommand } from '../../../../../../models/macro';

export class ConjureHealing extends SpellCommand {

  aliases = ['conjurehealing', 'cast conjurehealing'];
  requiresLearn = true;
  spellRef = 'ConjureHealing';
  canTargetSelf = true;

}
