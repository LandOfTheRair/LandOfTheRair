import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Absorption extends SpellCommand {

  aliases = ['absorption', 'cast absorption'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Absorption';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Absorption');
  }

}
