const FIRST_LEVEL_CONSTANT_CHANGER = 19;

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
