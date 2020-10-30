
const FIRST_LEVEL_CONSTANT_CHANGER = 19;

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