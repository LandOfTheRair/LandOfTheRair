import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Drain extends SpellCommand {

  override aliases = ['drain', 'cast drain'];
  override requiresLearn = true;
  override spellRef = 'Drain';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && caster.hp.current < caster.hp.maximum * 0.75;
  }

}
