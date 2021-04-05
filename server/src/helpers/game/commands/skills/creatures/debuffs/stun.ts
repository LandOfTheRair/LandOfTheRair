import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Stun extends SpellCommand {

  override aliases = ['stun', 'cast stun'];
  override requiresLearn = true;
  override spellRef = 'Stun';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Stun')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyStunned');
  }

}
