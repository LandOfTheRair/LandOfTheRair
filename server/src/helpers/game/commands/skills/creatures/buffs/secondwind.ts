import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class SecondWind extends SpellCommand {

  aliases = ['secondwind', 'cast secondwind'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'SecondWind';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'SecondWind');
  }

}
