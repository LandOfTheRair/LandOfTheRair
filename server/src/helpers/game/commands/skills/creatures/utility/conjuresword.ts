import { SpellCommand } from '../../../../../../models/macro';

export class ConjureSword extends SpellCommand {

  override aliases = ['conjuresword', 'cast conjuresword'];
  override requiresLearn = true;
  override spellRef = 'ConjureSword';
  override canTargetSelf = true;

}
