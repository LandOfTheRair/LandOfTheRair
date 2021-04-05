import { SpellCommand } from '../../../../../../models/macro';

export class Combust extends SpellCommand {

  override aliases = ['combust', 'cast combust'];
  override requiresLearn = true;
  override spellRef = 'Combust';

}
