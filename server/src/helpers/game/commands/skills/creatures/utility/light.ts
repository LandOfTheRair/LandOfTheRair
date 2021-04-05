import { SpellCommand } from '../../../../../../models/macro';

export class Light extends SpellCommand {

  override aliases = ['light', 'cast light'];
  override requiresLearn = true;
  override spellRef = 'Light';
  override canTargetSelf = true;

}
