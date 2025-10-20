import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';

export class DoubleAttack extends SpellCommand {
  override aliases = ['doubleattack'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return distanceFrom(caster, target) <= this.range(caster);
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.combatHelper.physicalAttack(executor, target);
    this.game.combatHelper.physicalAttack(executor, target);
  }
}
