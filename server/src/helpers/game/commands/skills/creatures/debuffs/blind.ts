import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Blind extends SpellCommand {

  aliases = ['blind', 'cast blind'];
  requiresLearn = true;
  spellRef = 'Blind';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Blind')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyBlinded');
  }

}
