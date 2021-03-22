import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Daze extends SpellCommand {

  aliases = ['daze', 'cast daze'];
  requiresLearn = true;
  spellRef = 'Daze';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Daze')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyDazed');
  }

}
