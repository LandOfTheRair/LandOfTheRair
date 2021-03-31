import { SpellCommand } from '../../../../../../models/macro';

export class Push extends SpellCommand {

  aliases = ['push', 'cast push'];
  requiresLearn = true;
  spellRef = 'Push';

}
