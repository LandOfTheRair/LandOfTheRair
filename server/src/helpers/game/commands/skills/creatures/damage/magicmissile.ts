import { SpellCommand } from '../../../../../../models/macro';

export class MagicMissile extends SpellCommand {

  aliases = ['magicmissile', 'cast magicmissile'];
  requiresLearn = true;
  spellRef = 'MagicMissile';

}
