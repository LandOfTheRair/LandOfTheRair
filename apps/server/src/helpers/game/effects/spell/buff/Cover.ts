import { traitLevelValue } from '@lotr/content';
import { getEffect } from '@lotr/effects';
import type { ICharacter, IStatusEffect } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Effect } from '../../../../../models';

export class Cover extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    const target = this.getLinkedTarget(char, effect);
    if (!target) {
      this.sendMessage(char, { message: 'Could not find target to cover!' });
      return;
    }

    this.sendMessage(char, { message: `You cover ${target.name}!` });
    this.sendMessage(target, { message: `${char.name} is covering you!` });

    this.game.effectHelper.addEffect(target, char, 'Covered', {
      effect: {
        duration: -1,
        extra: {
          damage: traitLevelValue(char, 'ShieldingCover'),
          potency: 25 + traitLevelValue(char, 'ImprovedCover'),
          linkedTo: char.uuid,
        },
      },
    });
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if ((effect.effectInfo.currentTick ?? 0) % 5 === 0) {
      const target = this.getLinkedTarget(char, effect);
      if (!target || distanceFrom(char, target) > 4) {
        this.sendMessage(char, { message: 'Your cover target has been lost!' });
        this.game.effectHelper.removeEffect(char, effect);
        return;
      }

      const coveredEffectRef = getEffect(target, 'Covered');
      if (!coveredEffectRef) {
        this.sendMessage(char, { message: 'Your cover target has been lost!' });
        this.game.effectHelper.removeEffect(char, effect);
        return;
      }
    }
  }

  public override unapply(char: ICharacter, effect: IStatusEffect) {
    const target = this.getLinkedTarget(char, effect);
    if (target) {
      const coveredTargetRef = getEffect(target, 'Covered');
      if (coveredTargetRef) {
        this.game.effectHelper.removeEffect(target, coveredTargetRef);
      }
    }
  }
}
