import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Debilitate extends SpellCommand {

  override aliases = ['debilitate', 'cast debilitate'];
  override requiresLearn = true;
  override spellRef = 'Debilitate';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Debilitate')
        && !this.game.effectHelper.hasEffect(target, 'RecentlyDebilitated');
  }

}
