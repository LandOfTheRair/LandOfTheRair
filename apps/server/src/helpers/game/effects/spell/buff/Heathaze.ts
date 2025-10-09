import { getEffect, hasEffect } from '@lotr/effects';
import {
  VisualEffect,
  type ICharacter,
  type IStatusEffect,
} from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class Heathaze extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendVFX(char, effect);

    this.game.messageHelper.sendLogMessageToRadius(char, 5, {
      message: 'You see a mind-numbing warm haze!',
    });
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    this.sendVFX(char, effect);

    this.game.targettingHelper
      .getPossibleAOETargets(char, char, 1, 4)
      .forEach((target) => {
        const existingEffect = getEffect(target, 'BuildupHeat');
        if (existingEffect) {
          existingEffect.effectInfo.buildUpCurrent ??= 0;
          existingEffect.effectInfo.buildUpCurrent += 5;
        } else {
          this.game.effectHelper.addEffect(target, char, 'BuildupHeat', {
            effect: {
              extra: {
                buildUpDecay: 3,
                buildUpCurrent: 25,
                buildUpMax: 200 + target.level * 5,
              },
            },
          });
        }

        if (!hasEffect(target, 'Braindaze')) {
          this.game.effectHelper.addEffect(target, char, 'Braindaze', {
            effect: {
              extra: {
                potency: effect.effectInfo.potency,
              },
            },
          });
        }
      });
  }

  private sendVFX(char: ICharacter, effect: IStatusEffect) {
    this.game.messageHelper.sendVFXMessageToRadius(char, 7, {
      vfx: VisualEffect.HeatMistFull,
      vfxTiles: this.game.messageHelper.getVFXTilesForTile(char, 1),
      vfxTimeout: 1500,
    });
  }
}
