
/* eslint-disable no-bitwise */

import { Allegiance, Direction, IPlayer } from '../interfaces';
import { directionHasAll } from './direction';

export const basePlayerSprite = (player: IPlayer | { allegiance: Allegiance; gender: 'male'|'female' }) => {
  let choices = { male: 725, female: 675 };

  switch (player.allegiance) {
  case Allegiance.Townsfolk:   { choices = { male: 725, female: 675 }; break; }
  case Allegiance.Wilderness:  { choices = { male: 730, female: 680 }; break; }
  case Allegiance.Royalty:     { choices = { male: 735, female: 685 }; break; }
  case Allegiance.Adventurers: { choices = { male: 740, female: 690 }; break; }
  case Allegiance.Underground: { choices = { male: 745, female: 695 }; break; }
  case Allegiance.Pirates:     { choices = { male: 750, female: 700 }; break; }
  }

  return choices[player.gender];
};

/**
 * Determines the base swimming sprite index from the swimming spritesheet for the player
 *
 * @param player The player to use for calulcating
 * @returns The base creature index
 */
export const basePlayerSwimmingSprite = (player: IPlayer) => {
  let choices = { male: 6, female: 0 };

  switch (player.allegiance) {
  case Allegiance.Townsfolk:   { choices = { male: 6,  female: 0 }; break; }
  case Allegiance.Wilderness:  { choices = { male: 7,  female: 1 }; break; }
  case Allegiance.Royalty:     { choices = { male: 8,  female: 2 }; break; }
  case Allegiance.Adventurers: { choices = { male: 9,  female: 3 }; break; }
  case Allegiance.Underground: { choices = { male: 10, female: 4 }; break; }
  case Allegiance.Pirates:     { choices = { male: 11, female: 5 }; break; }
  }

  return choices[player.gender];
};

/**
 * Given the index of a sprite in the creatures spritesheet,
 * will calculate a new index for the given direction
 *
 * @param index Index of creature
 * @param direction New direction
 * @returns Index of creature matching the given direction
 */
export const spriteForCreatureDirection = (index: number, direction: Direction): number => {
  if (index < 0) return index;
  const baseIndex = index - index % 5;
  switch (direction) {
  case Direction.Center:    return baseIndex + 4;
  case Direction.Northwest: return baseIndex + 1;
  case Direction.North:     return baseIndex + 3;
  case Direction.Northeast: return baseIndex + 2;
  case Direction.West:      return baseIndex + 1;
  case Direction.East:      return baseIndex + 2;
  case Direction.Southwest: return baseIndex + 1;
  case Direction.South:     return baseIndex;
  case Direction.Southeast: return baseIndex + 2;
  default: return index;
  }
};


/**
 * Given the direction, will return the offset to be added to the base swimming index
 * to get the correct sprite
 *
 * @param direction Direction to get the offset for
 * @returns Offset from the base to get the direction
 */
export const spriteOffsetForSwimmingDirection = (direction: Direction): number => {
  switch (direction) {
  case Direction.Center:    return 60;
  case Direction.Northwest: return 84;
  case Direction.North:     return 12;
  case Direction.Northeast: return 36;
  case Direction.West:      return 84;
  case Direction.East:      return 36;
  case Direction.Southwest: return 84;
  case Direction.South:     return 60;
  case Direction.Southeast: return 36;
  default: return 60;
  }
};

/**
 * Gets the multi direction that represents the walls directions.
 *
 * @param index The index of the sprite in the walls spritesheet.
 * @returns The multi direction for the wall.
 */
export const spriteDirectionForWall = (index: number): Direction => {
  if (index < 0) return Direction.Center;

  const wallDirectionData = [
    0b000_0_0_000, 0b010_1_1_010, 0b000_1_1_010, 0b010_1_0_010, 0b010_1_1_000,  0b010_0_1_010, 0b000_0_1_010, 0b000_1_0_010,
    0b010_1_0_000, 0b010_0_1_000, 0b000_0_0_010, 0b000_1_0_000, 0b010_0_0_000,  0b000_0_1_000, 0b010_0_0_010, 0b000_1_1_000
  ];
  let column = index % 16;

  if (column === 13) {
    // Column 13 is sometimes identical to column 9, but 9 has more directions, so we use that
    const setOverridesColumn13 = [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1];
    const row = Math.floor(column / 16);
    if (setOverridesColumn13[row]) {
      column = 9;
    }
  }
  return wallDirectionData[column];
};

/**
 * Gets a number representing the group that the terrain belongs to.
 *
 * @param index The index of the sprite in the terrain spritesheet
 * @returns The id of the terrains group, or -1 if invalid
 */
export const spriteTerrainSetNumber = (index: number): number => {
  if (index < 0) return -1;
  if (index > 959) return -1; // The number of terrains in the spritesheet - 1;
  return Math.floor(index / 48); // Number of tiles in set
};


/**
 * Given an index, and direction, finds a similar terrain that matches
 *
 * @param index The index of the sprite in the terrains spritesheet.
 * @param direction The multi direction wanted for the terrain.
 */
export const spriteTerrainForDirection = (index: number, direction: Direction): number => {
  const column = index % 48;
  const baseIndex = index - column;
  let allowedDirs  = Direction.Cardinals;
  if (directionHasAll(direction, Direction.WestAndNorth)) allowedDirs |= Direction.Northwest;
  if (directionHasAll(direction, Direction.WestAndSouth)) allowedDirs |= Direction.Southwest;
  if (directionHasAll(direction, Direction.EastAndNorth)) allowedDirs |= Direction.Northeast;
  if (directionHasAll(direction, Direction.EastAndSouth)) allowedDirs |= Direction.Southeast;
  direction &= allowedDirs;
  switch (direction as number) {
  case 0b000_0_0_000: return baseIndex;
  case 0b011_1_1_111: return baseIndex + 1;
  case 0b110_1_1_111: return baseIndex + 2;
  case 0b111_1_1_110: return baseIndex + 3;
  case 0b111_1_1_011: return baseIndex + 4;
  case 0b010_1_1_111: return baseIndex + 5;
  case 0b110_1_1_110: return baseIndex + 6;
  case 0b111_1_1_010: return baseIndex + 7;
  case 0b111_1_1_011: return baseIndex + 8;
  case 0b010_1_1_011: return baseIndex + 9;
  case 0b010_1_1_110: return baseIndex + 10;
  case 0b110_1_1_010: return baseIndex + 11;
  case 0b011_1_1_010: return baseIndex + 12;
  case 0b010_1_1_010: return baseIndex + 13;
  case 0b000_1_1_111: return baseIndex + 14;
  case 0b110_1_0_110: return baseIndex + 15;
  case 0b111_1_1_000: return baseIndex + 16;
  case 0b011_0_1_011: return baseIndex + 17;
  case 0b011_1_1_000: return baseIndex + 18;
  case 0b110_1_1_000: return baseIndex + 19;
  case 0b000_1_1_110: return baseIndex + 20;
  case 0b000_1_1_011: return baseIndex + 21;
  case 0b010_1_0_110: return baseIndex + 22;
  case 0b010_0_1_011: return baseIndex + 23;
  case 0b011_0_1_010: return baseIndex + 24;
  case 0b110_1_0_010: return baseIndex + 25;
  case 0b000_1_1_010: return baseIndex + 26;
  case 0b010_1_0_010: return baseIndex + 27;
  case 0b010_1_1_000: return baseIndex + 28;
  case 0b010_0_1_010: return baseIndex + 29;
  case 0b000_0_1_011: return baseIndex + 30;
  case 0b000_1_0_110: return baseIndex + 31;
  case 0b110_1_0_000: return baseIndex + 32;
  case 0b011_0_1_000: return baseIndex + 33;
  case 0b000_0_1_010: return baseIndex + 34;
  case 0b000_1_0_010: return baseIndex + 35;
  case 0b010_1_0_000: return baseIndex + 36;
  case 0b010_0_1_000: return baseIndex + 37;
  case 0b000_0_0_010: return baseIndex + 38;
  case 0b000_1_0_000: return baseIndex + 39;
  case 0b010_0_0_000: return baseIndex + 40;
  case 0b000_0_1_000: return baseIndex + 41;
  case 0b010_0_0_010: return baseIndex + 42;
  case 0b000_1_1_000: return baseIndex + 43;
  case 0b011_1_1_110: return baseIndex + 44;
  case 0b110_1_1_011: return baseIndex + 45;
  case 0b111_1_1_111: return baseIndex + 46;
  }
  throw new Error(`Invalid direction ${direction}`);
};
