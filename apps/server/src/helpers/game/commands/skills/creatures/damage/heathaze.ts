import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class Heathaze extends SpellCommand {
  override aliases = ['heathaze', 'cast heathaze'];
  override requiresLearn = true;
  override targetsFriendly = true;
  override canTargetSelf = true;
  override spellRef = 'Heathaze';

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
