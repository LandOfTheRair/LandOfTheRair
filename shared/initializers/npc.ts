import { ICharacter, INPC } from '../interfaces';
import { initializeCharacter } from './character';

export const initializeNPC = (char: INPC): ICharacter => {

  const baseChar = initializeCharacter(char);

  // TODO: owner, aquaticOnly, avoidWater, deathTicks

  return {
    ...baseChar
  };
};
