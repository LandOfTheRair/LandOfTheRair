import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class BarNecro extends SpellCommand {

  aliases = ['barnecro', 'cast barnecro'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'BarNecro';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'BarNecro');
  }

}
