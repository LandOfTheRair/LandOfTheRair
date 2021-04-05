import { SpellCommand } from '../../../../../../models/macro';

export class MagicBolt extends SpellCommand {

  override aliases = ['magicbolt', 'cast magicbolt'];
  override requiresLearn = true;
  override spellRef = 'MagicBolt';

}
