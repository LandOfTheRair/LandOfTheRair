import { getSkillLevel, mana } from '@lotr/characters';
import type { DamageArgs, ICharacter, IStatusEffect } from '@lotr/interfaces';
import { DamageClass, ItemSlot, Stat } from '@lotr/interfaces';
import { distanceFrom } from '@lotr/shared';
import { Effect } from '../../../../../models';

export class RageStance extends Effect {
  public override create(char: ICharacter, effect: IStatusEffect) {
    const rightHand = char.items.equipment[ItemSlot.RightHand];
    if (!rightHand) return;

    this.game.messageHelper.sendLogMessageToRadius(char, 4, {
      message: `${char.name} takes on a offensive stance.`,
    });

    effect.effectInfo.usedWeapon = rightHand.uuid;

    const skillName = this.game.itemHelper.getItemProperty(rightHand, 'type');
    const skill = getSkillLevel(char, skillName) + 1;

    effect.effectInfo.statChanges = {
      [Stat.Offense]: skill,
      [Stat.Accuracy]: skill,
      [Stat.WeaponDamageRolls]: Math.floor(skill / 5),
      [Stat.WeaponArmorClass]: -skill,
      [Stat.Defense]: -skill,
      [Stat.Mitigation]: -skill,
    };
  }

  public override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    if (char.combatTicks > 0) {
      mana(char, 1);
    }

    if (
      effect.effectInfo.usedWeapon !==
      char.items.equipment[ItemSlot.RightHand]?.uuid
    ) {
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

    mana(char, 1);

    // if we're on someone and we can viciously assault, give it a try
    if (
      this.game.traitHelper.rollTraitValue(char, 'ViciousAssault') &&
      distanceFrom(char, target) === 0
    ) {
      this.game.spellManager.castSpell('Cleave', char, target);
    }
  }
}
