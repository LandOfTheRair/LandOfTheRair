import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Cure extends SpellCommand {

  override aliases = ['cure', 'cast cure'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'Cure';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && target.hp.current < (target.hp.maximum * 0.75);
  }
}
