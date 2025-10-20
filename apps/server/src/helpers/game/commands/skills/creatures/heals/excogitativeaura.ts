import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class ExcogitativeAura extends SpellCommand {
  override aliases = ['excogitativeaura', 'cast excogitativeaura'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'ExcogitativeAura';

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
