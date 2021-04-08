import { SpellCommand } from '../../../../../../models/macro';

export class FireMist extends SpellCommand {

  override aliases = ['firemist', 'cast firemist'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'FireMist';

}
