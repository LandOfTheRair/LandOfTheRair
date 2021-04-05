import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Blind extends SpellCommand {

  override aliases = ['blind', 'cast blind'];
  override requiresLearn = true;
  override spellRef = 'Blind';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Blind')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyBlinded');
  }

}
