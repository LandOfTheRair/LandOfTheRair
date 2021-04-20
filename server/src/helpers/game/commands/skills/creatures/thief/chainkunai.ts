import { SpellCommand } from '../../../../../../models/macro';

export class ChainKunai extends SpellCommand {

  override aliases = ['chainkunai', 'cast chainkunai'];
  override requiresLearn = true;
  override spellRef = 'ChainKunai';

}
