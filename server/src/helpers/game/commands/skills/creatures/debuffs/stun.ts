import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Stun extends SpellCommand {

  aliases = ['stun', 'cast stun'];
  requiresLearn = true;
  spellRef = 'Stun';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Stun')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyStunned');
  }

}
