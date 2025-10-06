import type { IPlayer, Tradeskill } from '@lotr/interfaces';

const TRADESKILL_COEFFICIENT = 1.35;

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

export function calcTradeskillLevelForCharacter(
  character: IPlayer,
  skill: Tradeskill,
): number {
  if (!skill) {
    throw new Error('Trying to calculate skill of undefined');
  }

  const skillValue = character.tradeskills[skill.toLowerCase()] ?? 0;
  return calculateTradeskillLevelFromXP(skillValue);
}
