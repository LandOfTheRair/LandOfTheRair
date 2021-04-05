import { SpellCommand } from '../../../../../../models/macro';

export class Push extends SpellCommand {

  override aliases = ['push', 'cast push'];
  override requiresLearn = true;
  override spellRef = 'Push';

}
