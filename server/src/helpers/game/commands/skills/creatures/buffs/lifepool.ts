import { ICharacter } from '../../../../../../interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Lifepool extends SpellCommand {

  override aliases = ['lifepool', 'cast lifepool'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Lifepool';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return super.canUse(caster, target)
        && !this.game.effectHelper.hasEffect(target, 'Lifepool')
        && !this.game.effectHelper.hasEffect(target, 'Manapool');
  }

}
