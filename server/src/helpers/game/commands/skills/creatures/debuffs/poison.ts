import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Poison extends SpellCommand {

  aliases = ['poison', 'cast poison'];
  requiresLearn = true;
  spellRef = 'Poison';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Poison');
  }

}
