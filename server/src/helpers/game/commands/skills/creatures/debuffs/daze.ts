import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Daze extends SpellCommand {

  override aliases = ['daze', 'cast daze'];
  override requiresLearn = true;
  override spellRef = 'Daze';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Daze')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyDazed');
  }

}
