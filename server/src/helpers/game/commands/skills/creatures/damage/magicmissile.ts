import { SpellCommand } from '../../../../../../models/macro';

export class MagicMissile extends SpellCommand {

  override aliases = ['magicmissile', 'cast magicmissile'];
  override requiresLearn = true;
  override spellRef = 'MagicMissile';

}
