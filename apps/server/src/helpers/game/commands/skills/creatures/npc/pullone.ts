import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

export class PullOne extends SpellCommand {
  override aliases = ['pullone'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) > 0;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.spellManager.castSpell('Pull', executor, target);
  }
}
