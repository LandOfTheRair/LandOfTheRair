import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { SpellCommand } from '../../../../../../../models/macro';

export class DedlaenSpiderImmobilize extends SpellCommand {
  override aliases = ['dedlaenspiderimmobilize'];
  override requiresLearn = true;

  override canUse(caster: ICharacter, target: ICharacter): boolean {
    return (
      distanceFrom(caster, target) === 0 &&
      this.game.characterHelper.getStat(target, Stat.STR) < 25 &&
      !hasEffect(target, 'Immobilized') &&
      !hasEffect(target, 'RecentlyImmobilized')
    );
  }

  override mpCost(): number {
    return 0;
  }

  override use(executor: ICharacter, target: ICharacter) {
    if (this.game.characterHelper.isPlayer(executor)) return;

    const duration = Math.floor(
      Math.max(2, 20 - this.game.characterHelper.getStat(target, Stat.STR)),
    );
    this.game.effectHelper.addEffect(target, executor, 'Immobilized', {
      effect: { duration },
    });

    this.game.messageHelper.sendSimpleMessage(
      target,
      'You are stuck in a web!',
    );
  }
}
