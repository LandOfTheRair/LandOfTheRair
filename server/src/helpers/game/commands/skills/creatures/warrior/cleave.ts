import { SpellCommand } from '../../../../../../models/macro';

export class Cleave extends SpellCommand {

  override aliases = ['cleave', 'art cleave'];
  override requiresLearn = true;
  override spellRef = 'Cleave';

}
