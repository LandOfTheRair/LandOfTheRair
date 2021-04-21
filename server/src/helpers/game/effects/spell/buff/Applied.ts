import { DamageArgs, DamageClass, ICharacter, IStatusEffect } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Applied extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    this.sendMessage(char, { message: `Your weapons are now coated with ${effect.effectInfo.applyEffect?.name}.` });
    effect.effectInfo.tooltip = `Physical attacks will apply ${effect.effectInfo.applyEffect?.name}`;
  }

  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical || !effect.effectInfo.applyEffect) return;

    const aEffect = effect.effectInfo.applyEffect;

    this.game.effectHelper.addEffect(
      target,
      char,
      aEffect.name,
      { effect: { duration: aEffect.duration, extra: { potency: aEffect.potency } } }
    );
  }

}
