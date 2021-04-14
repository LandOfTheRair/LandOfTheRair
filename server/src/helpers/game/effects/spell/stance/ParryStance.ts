import { DamageArgs, DamageClass, ICharacter, IStatusEffect, ItemSlot, Stat } from '../../../../../interfaces';
import { Effect } from '../../../../../models';

export class ParryStance extends Effect {

  public override create(char: ICharacter, effect: IStatusEffect) {

    this.game.messageHelper.sendLogMessageToRadius(char, 4, { message: `${char.name} takes on a defensive stance.` });

    const rightHand = char.items.equipment[ItemSlot.RightHand];
    if (!rightHand) return;

    effect.effectInfo.usedWeapon = rightHand.uuid;

    const skillName = this.game.itemHelper.getItemProperty(rightHand, 'type');
    const skill = this.game.characterHelper.getSkillLevel(char, skillName) + 1;

    effect.effectInfo.potency = skill;

    effect.effectInfo.statChanges = {
      [Stat.Offense]: -skill,
      [Stat.Accuracy]: -skill,
      [Stat.WeaponArmorClass]: skill,
      [Stat.Defense]: skill,
      [Stat.Mitigation]: Math.floor(skill / 5)
    };
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (effect.effectInfo.usedWeapon !== char.items.equipment[ItemSlot.RightHand]?.uuid) {
      this.game.effectHelper.removeEffect(char, effect);
    }
  }

  public override incoming(
    effect: IStatusEffect,
    char: ICharacter,
    attacker: ICharacter | null,
    damageArgs: DamageArgs,
    currentDamage: number
  ): number {
    if (!attacker || damageArgs.damageClass !== DamageClass.Physical) return currentDamage;

    return Math.floor(currentDamage * (1 - (effect.effectInfo.potency / 100)));
  }

}
