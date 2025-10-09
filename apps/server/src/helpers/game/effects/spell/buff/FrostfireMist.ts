import {
  DamageClass,
  VisualEffect,
  type ICharacter,
  type IStatusEffect,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Effect } from '../../../../../models';

export class FrostfireMist extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendVFX(effect);

    const center = effect.effectInfo.center;
    if (center) {
      this.game.messageHelper.sendLogMessageToRadius(center, 7, {
        message: 'You are surrounded by a warm mist!',
      });
    }
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if ((effect.effectInfo.currentTick ?? 0) % 5 === 0) {
      this.sendVFX(effect);
    }

    const center = effect.effectInfo.center;
    if (center) {
      this.game.targettingHelper
        .getPossibleAOETargets(char, center, 2, 8)
        .forEach((target) => {
          this.game.combatHelper.magicalAttack(char, target, {
            atkMsg: 'You envelop %0 in a cold heat!',
            defMsg: 'You are overtaken by a cold heat.',
            damage: effect.effectInfo.potency,
            damageClass:
              (effect.effectInfo.currentTick ?? 0) % 2 === 0
                ? DamageClass.Fire
                : DamageClass.Ice,
          });
        });

      if (distanceFrom(char, center) > 5) {
        this.game.effectHelper.removeEffect(char, effect);
        this.sendMessage(char, { message: 'Your warm mist dissipates!' });
        return;
      }
    }
  }

  private sendVFX(effect: IStatusEffect) {
    const { center } = effect.effectInfo;
    if (!center) return;

    this.game.messageHelper.sendVFXMessageToRadius(center, 7, {
      vfx: VisualEffect.GrayMistFull,
      vfxTiles: this.game.messageHelper.getVFXTilesForTile(center, 2),
      vfxTimeout: 6000,
    });
  }
}
