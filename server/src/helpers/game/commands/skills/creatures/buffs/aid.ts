import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Aid extends SpellCommand {

  override aliases = ['aid', 'cast aid'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'Aid';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target) && !this.game.effectHelper.hasEffect(target, 'Aid');
  }

}
