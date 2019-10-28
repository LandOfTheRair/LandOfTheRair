import { ICharacter, INPC } from '../interfaces';
import { initializeCharacter } from './character';

export const initializeNPC = (char: INPC): ICharacter => {

  const baseChar = initializeCharacter({});

  // TODO: owner, aquaticOnly, avoidWater, deathTicks

  return {
    ...baseChar
  };
};
