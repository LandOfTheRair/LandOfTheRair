import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class HolyBath extends SpellCommand {
  override aliases = ['holybath', 'cast holybath'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'HolyBath';

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      super.canUse(caster, target) &&
      !this.game.effectHelper.hasSimilarEffects(target, 'PersistentAOE')
    );
  }

  override use(executor: ICharacter, target: ICharacter) {
    super.use(executor, executor);
  }
}
