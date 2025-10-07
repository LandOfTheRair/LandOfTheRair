import type { ICharacter, INPC } from '@lotr/interfaces';
import { Hostility } from '@lotr/interfaces';

// check if we can gain skill from this target
export function canGainSkillFromTarget(target: ICharacter): boolean {
  if (!target) return false;
  if ((target as INPC).hostility === Hostility.Never) return false;
  if ((target as INPC).owner) return false;
  return true;
}
