import { SpellCommand } from '../../../../../../models/macro';

export class ConjureShield extends SpellCommand {

  override aliases = ['conjureshield', 'cast conjureshield'];
  override requiresLearn = true;
  override spellRef = 'ConjureShield';
  override canTargetSelf = true;

}
