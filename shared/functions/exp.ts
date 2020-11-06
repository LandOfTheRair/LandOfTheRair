
const FIRST_LEVEL_CONSTANT_CHANGER = 19;
const SKILL_COEFFICIENT = 1.55;

export function calculateXPRequiredForLevel(level: number): number {
  const pre20XP = Math.pow(2, Math.min(FIRST_LEVEL_CONSTANT_CHANGER, level - 1)) * 1000;

  if (level <= FIRST_LEVEL_CONSTANT_CHANGER) {
    return pre20XP;
  }

  if (level <= 50) {
    return pre20XP * (Math.max(1, level - FIRST_LEVEL_CONSTANT_CHANGER));
  }

  const level50XP = pre20XP * (Math.max(1, 50 - FIRST_LEVEL_CONSTANT_CHANGER));

  if (level === 51) return Math.floor(level50XP * 1.5);
  if (level === 52) return Math.floor(level50XP * 3);
  if (level === 53) return Math.floor(level50XP * 5);
  if (level === 54) return Math.floor(level50XP * 7.5);
  if (level === 55) return Math.floor(level50XP * 10.5);

  return 99999999999999999999999 * level;
}

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
