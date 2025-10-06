import type { ICharacter } from '@lotr/interfaces';
import { SpellCommand } from '../../../../../../models/macro';

export class Manapool extends SpellCommand {
  override aliases = ['manapool', 'cast manapool'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Manapool';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !this.game.effectHelper.hasEffect(target, 'Lifepool') &&
      !this.game.effectHelper.hasEffect(target, 'Manapool')
    );
  }
}
