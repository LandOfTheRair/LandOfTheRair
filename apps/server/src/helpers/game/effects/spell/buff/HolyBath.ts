import {
  DamageClass,
  VisualEffect,
  type ICharacter,
  type IStatusEffect,
} from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Effect } from '../../../../../models';

export class HolyBath extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.sendVFX(effect);

    const center = effect.effectInfo.center;
    if (center) {
      this.game.messageHelper.sendLogMessageToRadius(center, 7, {
        message: 'You are bathed in a holy light!',
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
          this.game.combatHelper.magicalAttack(char, target, {
            atkMsg: 'You bathe %0 in a warm light!',
            defMsg: 'You feel a warm light heal your wounds.',
            damage: -effect.effectInfo.potency,
            damageClass: DamageClass.Heal,
          });
        });

      if (distanceFrom(char, center) > 5) {
        this.game.effectHelper.removeEffect(char, effect);
        this.sendMessage(char, { message: 'Your holy light dissipates!' });
        return;
      }
    }
  }

  private sendVFX(effect: IStatusEffect) {
    const { center } = effect.effectInfo;
    if (!center) return;

    this.game.messageHelper.sendVFXMessageToRadius(center, 7, {
      vfx: VisualEffect.HolyMistFull,
      vfxRadius: 2,
      vfxX: center.x,
      vfxY: center.y,
      vfxTimeout: 6000,
    });
  }
}
