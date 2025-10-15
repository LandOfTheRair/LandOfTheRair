import {
  settingClassConfigGet,
  settingGameGet,
  traitLevelValue,
} from '@lotr/content';
import { hasEffect } from '@lotr/effects';
import type { ICharacter } from '@lotr/interfaces';
import { Stat } from '@lotr/interfaces';
import { getStat } from './stats';

// hp regen is a min of 1, affected by a con modifier past 21
export function regenHPGet(character: ICharacter): number {
  const baseHPRegen = 1 + getStat(character, Stat.HPRegen);
  const hpRegenSlidingCon =
    settingGameGet('character', 'hpRegenSlidingCon') ?? 21;
  return Math.max(
    baseHPRegen,
    baseHPRegen + Math.max(0, getStat(character, Stat.CON) - hpRegenSlidingCon),
  );
}

// thieves and warriors have different mpregen setups
export function regenMPGet(character: ICharacter): number {
  const base = getStat(character, Stat.MPRegen);
  let boost = 0;

  const usesMana = settingClassConfigGet<'usesMana'>(
    character.baseClass,
    'usesMana',
  );

  // healers and mages get a boost because their primary function is spellcasting
  if (usesMana) {
    boost = settingGameGet('character', 'defaultCasterMPRegen') ?? 10;
  }

  const regensLikeThief = settingClassConfigGet<'regensLikeThief'>(
    character.baseClass,
    'regensLikeThief',
  );

  // thieves not in combat regen faster
  if (regensLikeThief) {
    // hidden thieves can regen stealth slightly faster based on their mpregen
    if (hasEffect(character, 'Hidden')) {
      const hiddenRegen = Math.max(
        0,
        Math.floor(base * traitLevelValue(character, 'ReplenishingShadows')),
      );

      return hiddenRegen;
    }

    // singing thieves have a way to get their stealth back
    if (hasEffect(character, 'Singing')) return 0;

    // thieves in combat get 10 base regen + 20% of their mp regen for every RR level
    if (character.combatTicks <= 0) {
      const regenStealth =
        Math.max(
          0,
          Math.floor(
            base * traitLevelValue(character, 'ReplenishingReverberation'),
          ),
        ) + (settingGameGet('character', 'thiefOOCRegen') ?? 10);

      return regenStealth;
    }

    return settingGameGet('character', 'thiefICRegen') ?? 1;
  }

  const regensLikeWarrior = settingClassConfigGet<'regensLikeWarrior'>(
    character.baseClass,
    'regensLikeWarrior',
  );

  // warriors are the inverse of thieves
  if (regensLikeWarrior) {
    if (character.combatTicks <= 0) {
      return settingGameGet('character', 'warriorOOCRegen') ?? -3;
    }
    return settingGameGet('character', 'warriorICRegen') ?? 3;
  }

  return base + boost;
}
