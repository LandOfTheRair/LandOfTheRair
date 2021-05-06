import { Allegiance, Direction, IPlayer } from '../interfaces';


export const basePlayerSprite = (player: IPlayer | { allegiance: Allegiance, gender: 'male'|'female' }) => {
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

export const spriteOffsetForDirection = (dir: Direction): number => {
  switch (dir) {
    case Direction.South:  return 0;
    case Direction.West:   return 1;
    case Direction.East:   return 2;
    case Direction.North:  return 3;
    case Direction.Center: return 4;
    default:               return 0;
  }
};

export const swimmingSpriteOffsetForDirection = (dir: Direction): number => {
  switch (dir) {
    case Direction.South:  return 60;
    case Direction.West:   return 84;
    case Direction.East:   return 36;
    case Direction.North:  return 12;
    case Direction.Center: return 60;
    default:               return 60;
  }
};

/**
 * Check if wall connects in direction
 * @param index The index of the sprite in the walls spritesheet.
 * @param direction The direction to check that the wall can connect to.
 * @returns If the wall at the index in the walls spritesheet connects to the direction
 */
export const doesWallConnect = (index: number, direction: Direction): boolean => {
  if (index < 0) return false;
  if (index > 367) return false; // The number of walls in the spritesheet - 1;
  let mask = 0;
  switch (direction) {
    case Direction.North: mask = 0b1000; break;
    case Direction.East:  mask = 0b0100; break;
    case Direction.South: mask = 0b0010; break;
    case Direction.West:  mask = 0b0001; break;
    default:              return false;
  }
  var column = index % 16;
  var row = Math.floor(column/16);
  // Tile 13 is sometimes identical to column 9, but 9 has more directions, so we need to use that
  if (column === 13) {
    // This is a list for each row in the spritesheet, 1 means we can use column 9 instead of 13
    const duplicateRowData = 0b11001110001110101000000;
    const isCol9 = (duplicateRowData >> (22 - row)) % 2 === 1;
    if (isCol9) {
      column = 9;
    }
  }
  // Binary data is North,East,South,West repeated for each column
  const wallData = (column < 8) ? 0b0000_1111_0111_1011_1101_1110_0110_0011: // column 0-7
                                  0b1001_1100_0010_0001_1000_0100_1010_0101; // column 8-15
  column = column % 8;
  const aWall = (wallData >> (7 - column) * 4) & 0b1111;
  return (aWall & mask) > 0;
}

/**
 * Gets a number representing the group that the terrain belongs to.
 * @param index The index of the sprite in the terrain spritesheet
 * @returns The id of the terrains group, or -1 if invalid
 */
export const getTerrainSetNumber = (index: number): number => {
  if (index < 0) return -1;
  if (index > 959) return -1; // The number of terrains in the spritesheet - 1;
  return Math.floor(index/48) //Number of tiles in set
}
