import { SpellCommand } from '../../../../../../models/macro';

export class IceMist extends SpellCommand {

  override aliases = ['icemist', 'cast icemist'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'IceMist';

}
