import { ICharacter, INPCDefinition } from '../interfaces';
import { initializeCharacter } from './character';

export const initializeNPC = (char: INPCDefinition): ICharacter => {

  const baseChar = initializeCharacter({});

  // TODO: owner, aquaticOnly, avoidWater, deathTicks

  return {
    ...baseChar
  };
};
