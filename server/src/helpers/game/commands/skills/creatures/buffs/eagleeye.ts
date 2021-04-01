import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class EagleEye extends SpellCommand {

  aliases = ['eagleeye', 'cast eagleeye'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'EagleEye';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'EagleEye');
  }

}
