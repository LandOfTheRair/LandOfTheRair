import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import type { ICharacter } from '@lotr/interfaces';

export class Pounce extends SpellCommand {
  override aliases = ['pounce'];
  override requiresLearn = true;

  override canUse(): boolean {
    return true;
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.movementHelper.moveTowards(executor, target);
    this.game.combatHelper.physicalAttack(executor, target);
  }
}
