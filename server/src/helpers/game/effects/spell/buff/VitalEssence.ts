import {
  DamageArgs,
  DamageClass,
  ICharacter,
  IStatusEffect,
  Stat,
} from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class VitalEssence extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.potency = effect.effectInfo.potency ?? 0;

    const hpBoost = effect.effectInfo.potency * 25;
    const acBoost = Math.floor(effect.effectInfo.potency / 2);

    effect.effectInfo.statChanges = {
      [Stat.HP]: hpBoost,
      [Stat.ArmorClass]: acBoost,
    };

    effect.effectInfo.tooltip = `Increase HP by ${hpBoost} and AC by ${acBoost}.`;
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (damageArgs.damageClass === DamageClass.Heal) return currentDamage;

    if (effect.effectInfo.charges) {
      effect.effectInfo.charges -= 1;
      if (effect.effectInfo.charges <= 0) {
        this.game.effectHelper.removeEffect(char, effect);
      }
    }

    return currentDamage;
  }
}
