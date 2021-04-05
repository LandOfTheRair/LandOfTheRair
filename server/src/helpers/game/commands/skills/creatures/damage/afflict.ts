import { SpellCommand } from '../../../../../../models/macro';

export class Afflict extends SpellCommand {

  override aliases = ['afflict', 'cast afflict'];
  override requiresLearn = true;
  override spellRef = 'Afflict';

}
