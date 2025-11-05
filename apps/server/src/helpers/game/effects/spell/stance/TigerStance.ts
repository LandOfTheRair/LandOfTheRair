import { getSkillLevel, isUtilizingMartialWeapon } from '@lotr/characters';
import { traitHasLearned } from '@lotr/content';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, ItemSlot, Skill, Stat } from '@lotr/interfaces';
import { Effect } from '../../../../../models';

export class TigerStance extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    this.game.messageHelper.sendLogMessageToRadius(char, 4, {
      message: `${char.name} takes on a fierce stance.`,
    });

    const skill = getSkillLevel(char, Skill.Martial) + 1;

    effect.effectInfo.statChanges = {
      [Stat.Defense]: -skill,
      [Stat.Mitigation]: -skill,
      [Stat.ArmorClass]: -skill,
      [Stat.Offense]: skill,
      [Stat.Accuracy]: skill,
      [Stat.Move]: 1,
      [Stat.STR]: Math.floor(skill / 4),
      [Stat.WeaponDamageRolls]: Math.floor(skill / 5),
    };
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const weapon = char.items.equipment[ItemSlot.RightHand];
    const canUseMartialWeapon =
      traitHasLearned(char, 'MartialWeapons') && isUtilizingMartialWeapon(char);

    if (weapon && !canUseMartialWeapon) {
      this.game.effectHelper.removeEffect(char, effect);
    }
  }

  public override outgoing(
    effect: IStatusEffect,
    char: ICharacter,
    target: ICharacter,
    damageArgs: DamageArgs,
  ): void {
    if (damageArgs.damageClass !== DamageClass.Physical) return;
  }
}
