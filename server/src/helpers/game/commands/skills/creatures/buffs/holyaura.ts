import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class HolyAura extends SpellCommand {

  aliases = ['holyaura', 'cast holyaura'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'HolyAura';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'HolyAura')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyShielded');
  }

}
