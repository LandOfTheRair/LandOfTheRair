import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Disease extends SpellCommand {

  aliases = ['disease', 'cast disease'];
  requiresLearn = true;
  spellRef = 'Disease';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Disease');
  }

}
