import { SpellCommand } from '../../../../../../models/macro';

export class Hail extends SpellCommand {

  override aliases = ['hail', 'cast hail'];
  override requiresLearn = true;
  override spellRef = 'Hail';

}
