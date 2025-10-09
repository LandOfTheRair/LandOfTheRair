import { getEffect } from '@lotr/effects';
import {
  VisualEffect,
  type ICharacter,
  type IStatusEffect,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Effect } from '../../../../../models';

export class IndomitableAura extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendVFX(effect);

    const center = effect.effectInfo.center;
    if (center) {
      this.game.messageHelper.sendLogMessageToRadius(center, 5, {
        message: 'You see mighty light envelop the area near you!',
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
        .getPossibleFriendlyAOETargets(char, center, 2)
        .forEach((target) => {
          const gotEffect = getEffect(target, 'Indomitable');
          if (!gotEffect) {
            this.game.effectHelper.addEffect(target, char, 'Indomitable', {
              effect: {
                extra: {
                  potency: effect.effectInfo.potency,
                },
              },
            });
          } else {
            gotEffect.endsAt = Date.now() + 10_000;
          }
        });

      if (distanceFrom(char, center) > 5) {
        this.game.effectHelper.removeEffect(char, effect);
        this.sendMessage(char, { message: 'Your mighty light dissipates!' });
        return;
      }
    }
  }

  private sendVFX(effect: IStatusEffect) {
    const { center } = effect.effectInfo;
    if (!center) return;

    this.game.messageHelper.sendVFXMessageToRadius(center, 7, {
      vfx: VisualEffect.HolyMistFull,
      vfxTiles: this.game.messageHelper.getVFXTilesForTile(center, 2),
      vfxTimeout: 6000,
    });
  }
}
