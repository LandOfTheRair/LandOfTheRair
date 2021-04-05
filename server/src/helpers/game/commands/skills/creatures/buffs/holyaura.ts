import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class HolyAura extends SpellCommand {

  override aliases = ['holyaura', 'cast holyaura'];
  override requiresLearn = true;
  override canTargetSelf = true;
  override spellRef = 'HolyAura';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'HolyAura')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyShielded');
  }

}
