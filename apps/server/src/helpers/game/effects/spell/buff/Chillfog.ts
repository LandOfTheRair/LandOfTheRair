import { getEffect, hasEffect } from '@lotr/effects';
import {
  VisualEffect,
  type ICharacter,
  type IStatusEffect,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Effect } from '../../../../../models';

export class Chillfog extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendVFX(effect);

    const center = effect.effectInfo.center;
    if (center) {
      this.game.messageHelper.sendLogMessageToRadius(center, 7, {
        message: 'You are surrounded by a bone-chilling cold fog!',
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
          const existingEffect = getEffect(target, 'BuildupChill');
          if (existingEffect) {
            existingEffect.effectInfo.buildUpCurrent ??= 0;
            existingEffect.effectInfo.buildUpCurrent += 5;
          } else {
            this.game.effectHelper.addEffect(target, char, 'BuildupChill', {
              effect: {
                extra: {
                  buildUpDecay: 3,
                  buildUpCurrent: 25,
                  buildUpMax: 200 + target.level * 5,
                },
              },
            });
          }

          if (!hasEffect(target, 'Brainchill')) {
            this.game.effectHelper.addEffect(target, char, 'Brainchill', {
              effect: {
                extra: {
                  potency: effect.effectInfo.potency,
                },
              },
            });
          }
        });

      if (distanceFrom(char, center) > 5) {
        this.game.effectHelper.removeEffect(char, effect);
        this.sendMessage(char, {
          message: 'Your bone-chilling fog dissipates!',
        });
        return;
      }
    }
  }

  private sendVFX(effect: IStatusEffect) {
    const { center } = effect.effectInfo;
    if (!center) return;

    this.game.messageHelper.sendVFXMessageToRadius(center, 7, {
      vfx: VisualEffect.BlueMistFull,
      vfxRadius: 2,
      vfxX: center.x,
      vfxY: center.y,
      vfxTimeout: 6000,
    });
  }
}
