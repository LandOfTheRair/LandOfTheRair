import { INPC, INPCDefinition } from '@lotr/interfaces';
import { initializeCharacter } from './character';

export const initializeNPC = (char: Partial<INPCDefinition> = {}): INPC => {
  const baseChar = initializeCharacter({}) as INPC;

  return {
    ...baseChar,
    npcId: char.npcId ?? '',
    aquaticOnly: char.aquaticOnly ?? false,
    avoidWater: char.avoidWater ?? false,
    usableSkills: char.usableSkills ?? [],
    skillOnKill: char.skillOnKill ?? 1,
    giveXp: char.giveXp ?? { min: 1, max: 100 },
    sprite: (char.sprite as number) ?? -1,
  };
};
