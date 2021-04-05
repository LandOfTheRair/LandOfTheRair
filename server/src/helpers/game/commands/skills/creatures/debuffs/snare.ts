import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Snare extends SpellCommand {

  override aliases = ['snare', 'cast snare'];
  override requiresLearn = true;
  override spellRef = 'Snare';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Snare')
        && !this.game.effectHelper.hasEffect(target, 'RecentlySnared');
  }

}
