import { getEffect } from '@lotr/effects';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Effect } from '../../../../../models';

export class Covered extends Effect {
  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    const percentageToSend = effect.effectInfo?.potency ?? 25;
    const percentageToBlock = effect.effectInfo?.damage ?? 0;

    const damageCut = Math.floor((currentDamage * percentageToSend) / 100);
    if (damageCut > 0) {
      const protector = this.getLinkedTarget(char, effect);
      if (protector) {
        const sentDamage =
          damageCut - Math.floor((damageCut * percentageToBlock) / 100);

        this.game.damageHelperOnesided.dealOnesidedDamage(protector, {
          damageMessage: `You redirect damage from ${char.name}!`,
          damage: sentDamage,
          damageClass: damageArgs.damageClass,
        });
      }
    }

    return currentDamage - damageCut;
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if ((effect.effectInfo.currentTick ?? 0) % 5 === 0) {
      const target = this.getLinkedTarget(char, effect);
      if (!target || distanceFrom(char, target) > 4) {
        this.sendMessage(char, { message: 'Your protector is too far away!' });
        this.game.effectHelper.removeEffect(char, effect);
        return;
      }

      const existingCover = getEffect(target, 'Cover');
      if (!existingCover || existingCover.effectInfo?.linkedTo !== char.uuid) {
        this.sendMessage(char, {
          message: 'Your protector is no longer covering you!',
        });
        this.game.effectHelper.removeEffect(char, effect);
        return;
      }
    }
  }
}
