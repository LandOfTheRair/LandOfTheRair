import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Snare extends SpellCommand {

  aliases = ['snare', 'cast snare'];
  requiresLearn = true;
  spellRef = 'Snare';

  canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Snare')
        && !this.game.effectHelper.hasEffect(target, 'RecentlySnared');
  }

}
