import { SpellCommand } from '../../../../../../models/macro';

export class Darkness extends SpellCommand {

  override aliases = ['darkness', 'cast darkness'];
  override requiresLearn = true;
  override spellRef = 'Darkness';
  override canTargetSelf = true;

}
