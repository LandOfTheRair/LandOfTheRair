import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Cure extends SpellCommand {

  aliases = ['cure', 'cast cure'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Cure';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && target.hp.current < (target.hp.maximum * 0.75);
  }
}
