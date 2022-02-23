import { DamageArgs, DamageClass, ICharacter, IStatusEffect, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class Overcharged extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    const potency = effect.effectInfo.potency ?? 50;
    effect.effectInfo.tooltip = `Stunned. AC/WIL lowered by ${potency}%. Incoming magical damage increased by 10%.`;

    effect.effectInfo.statChanges = {
      [Stat.ArmorClass]: Math.floor(this.game.characterHelper.getStat(char, Stat.ArmorClass) * (potency / 100)),
      [Stat.WIL]: Math.floor(this.game.characterHelper.getStat(char, Stat.WIL) * (potency / 100)),
    };
  }

  override apply(char: ICharacter, effect: IStatusEffect) {
    effect.effectInfo.isFrozen = true;

    this.game.effectHelper.removeEffectByName(char, 'Absorption');
    this.game.effectHelper.removeEffectByName(char, 'Spellshield');
    this.game.effectHelper.removeEffectByName(char, 'Protection');
  }

  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const potency = effect.effectInfo.potency ?? 50;

    if ((effect.effectInfo.currentTick ?? 0) > 3) {
      effect.effectInfo.isFrozen = false;
      effect.effectInfo.tooltip = `AC/WIL lowered by ${potency}%. Incoming magical damage increased by 10%.`;
    }
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number
  ): number {
    if (damageArgs.damageClass === DamageClass.Physical) return currentDamage;

    return Math.floor(currentDamage * 1.1);
  }

}
