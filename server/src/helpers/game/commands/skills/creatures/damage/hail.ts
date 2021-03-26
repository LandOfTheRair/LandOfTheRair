import { SpellCommand } from '../../../../../../models/macro';

export class Hail extends SpellCommand {

  aliases = ['hail', 'cast hail'];
  requiresLearn = true;
  spellRef = 'Hail';

}
