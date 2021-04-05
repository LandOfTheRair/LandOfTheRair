import { SpellCommand } from '../../../../../../models/macro';

export class Succor extends SpellCommand {

  override aliases = ['succor', 'cast succor'];
  override requiresLearn = true;
  override spellRef = 'Succor';
  override canTargetSelf = true;

}
