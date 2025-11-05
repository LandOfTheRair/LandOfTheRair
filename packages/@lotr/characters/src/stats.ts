import {
  itemPropertyGet,
  settingClassConfigGet,
  traitGet,
  traitLevelValue,
} from '@lotr/content';
import type { ArmorClass, ICharacter, StatBlock } from '@lotr/interfaces';
import { ItemClass, ItemSlot, Stat } from '@lotr/interfaces';
import { equipmentItemGet } from './equipment';
import { isPlayer } from './player';

// get a specific stat value from a character
export function getStat(character: ICharacter, stat: Stat): number {
  const value = character.totalStats[stat] ?? 0;
  if (value < 0 && stat === Stat.Mitigation) return 0;
  if (value === 0 && stat === Stat.DamageFactor) return 1;
  if (value !== 0 && stat === Stat.DamageFactor && isPlayer(character)) {
    return 1 + value;
  }
  return value;
}

// get a specific base stat value from a character
export function getBaseStat(character: ICharacter, stat: Stat): number {
  return character.stats[stat] ?? 0;
}

// get the primary spell casting stat for a character
export function castStat(char: ICharacter): Stat {
  return settingClassConfigGet<'castStat'>(char.baseClass, 'castStat');
}

// get the total stats from traits
export function characterStatValueFromTraits(
  character: ICharacter,
): Partial<StatBlock> {
  const stats: Partial<StatBlock> = {};

  Object.keys(character.allTraits ?? {}).forEach((trait) => {
    const traitRef = traitGet(trait, `GSVAFT:${character.name}`);
    if (!traitRef || !traitRef.statsGiven) return;

    Object.keys(traitRef.statsGiven).forEach((stat) => {
      if (!traitRef.statsGiven?.[stat as Stat]) return;

      let statAdd = stats[stat as Stat] || 0;
      statAdd +=
        (traitRef.statsGiven[stat as Stat] ?? 0) *
        (character.allTraits?.[trait] ?? 0);
      stats[stat as Stat] = statAdd;
    });
  });

  // handle reflective coating - boost spell reflect
  const reflectiveBoost = traitLevelValue(character, 'ReflectiveCoating');
  if (reflectiveBoost > 0) {
    stats[Stat.SpellReflectChance] = stats[Stat.SpellReflectChance] ?? 0;

    const leftHand = equipmentItemGet(character, ItemSlot.LeftHand);
    const rightHand = equipmentItemGet(character, ItemSlot.RightHand);

    if (
      leftHand &&
      itemPropertyGet(leftHand, 'itemClass') === ItemClass.Shield
    ) {
      stats[Stat.SpellReflectChance] += reflectiveBoost;
    }

    if (
      rightHand &&
      itemPropertyGet(rightHand, 'itemClass') === ItemClass.Shield
    ) {
      stats[Stat.SpellReflectChance] += reflectiveBoost;
    }
  }

  // handle unarmored savant - set base mitigation
  const savantBoost = traitLevelValue(character, 'UnarmoredSavant');
  if (savantBoost > 0) {
    stats[Stat.Mitigation] = stats[Stat.Mitigation] ?? 0;

    // if you have a main hand item, your bonus is cut in half
    const mainHandItemMultiplier = equipmentItemGet(
      character,
      ItemSlot.RightHand,
    )
      ? 0.5
      : 1;

    const item = equipmentItemGet(character, ItemSlot.Armor);
    const itemClass = itemPropertyGet(item, 'itemClass') ?? ItemClass.Rock;

    if (
      !item ||
      [ItemClass.Cloak, ItemClass.Robe, ItemClass.Fur].includes(
        itemClass as ArmorClass,
      )
    ) {
      stats[Stat.Mitigation] += savantBoost * mainHandItemMultiplier;

      // adjust for fur being a base 10 already
      if (itemClass === ItemClass.Fur) stats[Stat.Mitigation] -= 10;
    }
  }

  return stats;
}

// lose a permanent stat (from any reason)
export function statLosePermanent(
  character: ICharacter,
  stat: Stat,
  value = 1,
): boolean {
  const oneStats = [
    Stat.CHA,
    Stat.CON,
    Stat.DEX,
    Stat.INT,
    Stat.WIL,
    Stat.WIS,
    Stat.STR,
    Stat.AGI,
    Stat.LUK,
  ];
  const minimum = oneStats.includes(stat) ? 1 : 0;

  const curStat = character.stats[stat] ?? minimum;

  // cannot cannot go lower than 1
  if (curStat - value < minimum) return false;

  // lose the stat if we can
  character.stats[stat] = (character.stats[stat] ?? minimum) - value;

  return true;
}
