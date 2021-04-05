import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class EagleEye extends SpellCommand {

  override aliases = ['eagleeye', 'cast eagleeye'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'EagleEye';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'EagleEye');
  }

}
