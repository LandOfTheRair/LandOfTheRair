import { SpellCommand } from '../../../../../../models/macro';

export class MagicBolt extends SpellCommand {

  aliases = ['magicbolt', 'cast magicbolt'];
  requiresLearn = true;
  spellRef = 'MagicBolt';

}
