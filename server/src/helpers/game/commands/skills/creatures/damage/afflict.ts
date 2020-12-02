import { SpellCommand } from '../../../../../../models/macro';

export class Afflict extends SpellCommand {

  aliases = ['cast afflict'];
  requiresLearn = true;
  spellRef = 'Afflict';

}
