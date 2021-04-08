import { SpellCommand } from '../../../../../../models/macro';

export class Antipode extends SpellCommand {

  override aliases = ['antipode', 'cast antipode'];
  override requiresLearn = true;
  override spellRef = 'Antipode';

}
