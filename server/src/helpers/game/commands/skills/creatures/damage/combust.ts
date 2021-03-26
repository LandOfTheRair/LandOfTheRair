import { SpellCommand } from '../../../../../../models/macro';

export class Combust extends SpellCommand {

  aliases = ['combust', 'cast combust'];
  requiresLearn = true;
  spellRef = 'Combust';

}
