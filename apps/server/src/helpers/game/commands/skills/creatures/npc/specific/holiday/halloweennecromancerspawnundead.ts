import { isPlayer } from '@lotr/characters';
import { SpellCommand } from '@lotr/core';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';

export class HalloweenNecromancerSpawnUndead extends SpellCommand {
  override aliases = ['halloweennecromancerspawnundead'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return !hasEffect(caster, 'FindFamiliar');
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (isPlayer(executor)) return;

    this.game.messageHelper.sendLogMessageToRadius(executor, 8, {
      message: 'Come forth, my most powerful subjects!',
    });
    const summonCreatures = ['Halloween Horror', 'Halloween Horror'];
    this.game.effectHelper.addEffect(executor, executor, 'FindFamiliar', {
      effect: { duration: -1, extra: { summonCreatures } },
    });
  }
}
