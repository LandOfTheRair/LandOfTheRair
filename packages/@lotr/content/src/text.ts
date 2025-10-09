import type { Skill } from '@lotr/interfaces';
import { coreSkillDescs } from './core';

export function skillGetDescription(skill: Skill, skillLevel: number): string {
  const skillDescs = coreSkillDescs();
  return (
    skillDescs[skill][
      Math.min(skillDescs[skill].length - 1, skillLevel ?? 0)
    ] ?? ''
  );
}
