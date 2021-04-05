import { SpellCommand } from '../../../../../../models/macro';

export class Identify extends SpellCommand {

  override aliases = ['identify', 'cast identify'];
  override requiresLearn = true;
  override spellRef = 'Identify';
  override canTargetSelf = true;

}
