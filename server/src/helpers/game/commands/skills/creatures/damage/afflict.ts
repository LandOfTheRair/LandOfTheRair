import { SpellCommand } from '../../../../../../models/macro';

export class Afflict extends SpellCommand {

  aliases = ['afflict', 'cast afflict'];
  requiresLearn = true;
  spellRef = 'Afflict';

}
