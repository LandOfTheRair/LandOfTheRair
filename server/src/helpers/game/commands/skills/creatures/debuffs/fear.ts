import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Fear extends SpellCommand {

  override aliases = ['fear', 'cast fear'];
  override requiresLearn = true;
  override spellRef = 'Fear';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Fear')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyFeared');
  }

}
