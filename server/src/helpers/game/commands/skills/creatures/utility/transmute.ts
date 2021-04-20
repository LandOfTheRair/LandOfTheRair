import { SpellCommand } from '../../../../../../models/macro';

export class Transmute extends SpellCommand {

  override aliases = ['transmute', 'cast transmute'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'Transmute';

}
