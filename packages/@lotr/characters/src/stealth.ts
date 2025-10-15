import {
  coreHideReductions,
  itemPropertyGet,
  settingClassConfigGet,
  settingGameGet,
  traitLevelValue,
} from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import type { ICharacter, WeaponClass } from '@lotr/interfaces';
import { ItemSlot, Skill, Stat } from '@lotr/interfaces';
import { getSkillLevel } from './skills';
import { getStat } from './stats';

// get the stealth value for a character
export function stealthGet(char: ICharacter): number {
  let stealth =
    getSkillLevel(char, Skill.Thievery) + char.level + getStat(char, Stat.AGI);

  const hasStealthBonus = settingClassConfigGet<'hasStealthBonus'>(
    char.baseClass,
    'hasStealthBonus',
  );

  if (hasStealthBonus) {
    stealth *= settingGameGet('character', 'thiefStealthMultiplier') ?? 1.5;
  }

  if (hasEffect(char, 'Encumbered')) {
    stealth /= settingGameGet('character', 'stealthEncumberDivisor') ?? 2;
  }

  return Math.floor(stealth);
}

export function stealthPenaltyGet(char: ICharacter): number {
  const leftHandClass = char.items.equipment[ItemSlot.LeftHand]
    ? itemPropertyGet(char.items.equipment[ItemSlot.LeftHand], 'itemClass')
    : undefined;

  const rightHandClass = char.items.equipment[ItemSlot.RightHand]
    ? itemPropertyGet(char.items.equipment[ItemSlot.RightHand], 'itemClass')
    : undefined;

  const hideReductions = coreHideReductions();
  const totalReduction =
    (hideReductions[leftHandClass as WeaponClass] || 0) +
    (hideReductions[rightHandClass as WeaponClass] || 0);
  const shadowSheathMultiplier = Math.max(
    0,
    1 - traitLevelValue(char, 'ShadowSheath'),
  );

  return Math.floor(totalReduction * shadowSheathMultiplier);
}

// get perception value for a character
export function perceptionGet(char: ICharacter): number {
  let perception =
    getStat(char, Stat.Perception) + char.level + getStat(char, Stat.WIS);

  const hasPerceptionBonus = settingClassConfigGet<'hasPerceptionBonus'>(
    char.baseClass,
    'hasPerceptionBonus',
  );

  if (hasPerceptionBonus) perception *= 1.5;

  return perception;
}
