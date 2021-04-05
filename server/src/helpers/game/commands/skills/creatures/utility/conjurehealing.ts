import { SpellCommand } from '../../../../../../models/macro';

export class ConjureHealing extends SpellCommand {

  override aliases = ['conjurehealing', 'cast conjurehealing'];
  override requiresLearn = true;
  override spellRef = 'ConjureHealing';
  override canTargetSelf = true;

}
