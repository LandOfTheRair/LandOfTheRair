import type { ICharacter, IPlayer, Skill } from '@lotr/interfaces';

const SKILL_COEFFICIENT = 1.55;

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

export function calcSkillLevelForCharacter(
  character: ICharacter,
  skill: Skill,
): number {
  if (!skill) {
    throw new Error('Trying to calculate skill of undefined');
  }

  const skillValue = character.skills[skill.toLowerCase()] ?? 0;
  return calculateSkillLevelFromXP(skillValue);
}

export function assessPercentToNextSkill(
  character: ICharacter,
  skill: Skill,
): string {
  const skillValue = character.skills[skill] ?? 0;
  const skillLevel = calcSkillLevelForCharacter(character, skill);

  const nextLevel =
    skillLevel === 0 ? 100 : calculateSkillXPRequiredForLevel(skillLevel);
  const prevLevel =
    skillLevel === 0 ? 0 : calculateSkillXPRequiredForLevel(skillLevel - 1);

  const normalizedCurrent = skillValue - prevLevel;
  const normalizedMax = nextLevel - prevLevel;

  const percentWay = Math.min(
    99.999,
    Math.max(0, (normalizedCurrent / normalizedMax) * 100),
  ).toFixed(3);

  return percentWay;
}
