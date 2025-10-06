import type { IPlayer, Skill } from '@lotr/interfaces';

const FIRST_LEVEL_CONSTANT_CHANGER = 19;
const SKILL_COEFFICIENT = 1.55;
const TRADESKILL_COEFFICIENT = 1.35;

export function calculateXPRequiredForLevel(level: number): number {
  const pre20XP =
    Math.pow(2, Math.min(FIRST_LEVEL_CONSTANT_CHANGER, level - 1)) * 1000;

  if (level <= FIRST_LEVEL_CONSTANT_CHANGER) {
    return pre20XP;
  }

  const xpBoostForLevels50OrLess = Math.max(
    0,
    25_000_000 * Math.min(level - 20, 50),
  );

  if (level <= 50) {
    return (
      5_000_000 * (level - FIRST_LEVEL_CONSTANT_CHANGER) +
      pre20XP * Math.max(1, level - FIRST_LEVEL_CONSTANT_CHANGER) +
      xpBoostForLevels50OrLess
    );
  }

  const level50XP =
    5_000_000 * (50 - FIRST_LEVEL_CONSTANT_CHANGER) +
    pre20XP * Math.max(1, 50 - FIRST_LEVEL_CONSTANT_CHANGER) +
    xpBoostForLevels50OrLess;

  if (level === 51) return Math.floor(level50XP * 1.5);
  if (level === 52) return Math.floor(level50XP * 3);
  if (level === 53) return Math.floor(level50XP * 5);
  if (level === 54) return Math.floor(level50XP * 7.5);
  if (level === 55) return Math.floor(level50XP * 10.5);

  return 999999999999999 * level;
}

// skill functions
export function calculateSkillLevelFromXP(skillXP: number): number {
  const skillValue = skillXP ?? 0;
  if (skillValue < 100) return 0;

  const value = Math.log((skillValue - 1) / 100) / Math.log(SKILL_COEFFICIENT); // -1 because for some reason level 1 displays as 2, fuck math or something?
  return 1 + Math.floor(value);
}

export function calculateSkillXPRequiredForLevel(level: number): number {
  if (level === 0) return 100;

  return Math.floor(Math.pow(SKILL_COEFFICIENT, level) * 100);
}

// tradeskill functions
export function calculateTradeskillLevelFromXP(skillXP: number): number {
  const skillValue = skillXP ?? 0;
  if (skillValue < 5) return 0;

  const value = Math.log(skillValue / 5) / Math.log(TRADESKILL_COEFFICIENT);
  return Math.floor(value);
}

export function calculateTradeskillXPRequiredForLevel(level: number): number {
  if (level === 0) return 5;

  return Math.floor(Math.pow(TRADESKILL_COEFFICIENT, level) * 5);
}

export function percentCompleteSkill(player: IPlayer, skill: Skill): string {
  const skillValue = player.skills[skill] || 0;
  const skillLevel = calculateSkillLevelFromXP(skillValue);

  const nextLevel =
    skillLevel === 0 ? 100 : calculateSkillXPRequiredForLevel(skillLevel);
  const prevLevel =
    skillLevel === 0 ? 0 : calculateSkillXPRequiredForLevel(skillLevel - 1);

  const normalizedCurrent = skillValue - prevLevel;
  const normalizedMax = nextLevel - prevLevel;

  const percentWay = Math.max(
    0,
    (normalizedCurrent / normalizedMax) * 100,
  ).toFixed(3);

  return percentWay;
}
