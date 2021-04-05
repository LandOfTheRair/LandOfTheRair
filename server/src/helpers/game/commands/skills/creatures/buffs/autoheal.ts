import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Autoheal extends SpellCommand {

  aliases = ['autoheal', 'cast autoheal'];
  requiresLearn = true;
  canTargetSelf = true;
  spellRef = 'Autoheal';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Autoheal');
  }

}
