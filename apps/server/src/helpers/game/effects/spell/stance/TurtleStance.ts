import { getSkillLevel } from '@lotr/characters';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { ItemSlot, Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class TurtleStance extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    const rightHand = char.items.equipment[ItemSlot.RightHand];
    if (rightHand) return;

    this.game.messageHelper.sendLogMessageToRadius(char, 4, {
      message: `${char.name} takes on a careful stance.`,
    });

    const skill = getSkillLevel(char, Skill.Martial) + 1;

    effect.effectInfo.potency = skill;

    effect.effectInfo.statChanges = {
      [Stat.Offense]: -skill,
      [Stat.Accuracy]: -skill,
      [Stat.Move]: -1,
      [Stat.ArmorClass]: skill,
      [Stat.AGI]: Math.floor(skill / 4),
      [Stat.Defense]: skill,
      [Stat.Mitigation]: Math.floor(skill / 5),
    };
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (char.items.equipment[ItemSlot.RightHand]) {
      this.game.effectHelper.removeEffect(char, effect);
    }
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | undefined,
    damageArgs: DamageArgs,
    currentDamage: number,
  ): number {
    if (!attacker) return currentDamage;

    return currentDamage;
  }
}
