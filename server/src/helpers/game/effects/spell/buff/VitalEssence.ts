
import { ICharacter, IStatusEffect, Stat, Skill, DamageArgs } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class VitalEssence extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {
    const skill = this.game.characterHelper.getSkillLevel(char, Skill.Restoration) + 1;

    effect.effectInfo.statChanges = {
      [Stat.HP]: effect.effectInfo.potency,
      [Stat.ArmorClass]: skill
    };

    effect.effectInfo.tooltip = `Increase HP by ${effect.effectInfo.potency} and AC by ${skill}.`;
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number
  ): number {

    if (effect.effectInfo.charges) {
      effect.effectInfo.charges -= 1;
      if (effect.effectInfo.charges <= 0) {
        this.game.effectHelper.removeEffect(char, effect);
      }
    }

    return currentDamage;
  }

}
