import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Disease extends SpellCommand {

  override aliases = ['disease', 'cast disease'];
  override requiresLearn = true;
  override spellRef = 'Disease';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Disease');
  }

}
