/* eslint-disable no-bitwise */

import { Direction } from '../interfaces/direction';

/**
 * Splits a multi direction into an array of single directions
 *
 * @param direction An enum used to represent the directions
 * @returns An array with each direction
 * @example directionSplit(Direction.North | Direction.South) is [Direction.North, Direction.South]
 */
export function directionSplit(direction: Direction): Array<Direction> {
  const values: Direction[] = [];
  while (direction) {
    const bit = direction & (~direction + 1);
    values.push(bit);
    direction ^= bit;
  }
  return values;
}

/**
 * Converts the given single, or multi direction into its names, if the
 * direction is a multi direction, a seperator must be specified
 *
 * @param direction An enum used to represent the directions
 * @param seperator A string used to combine the symbol text
 * @returns A symbol, or symbols representing the direction.
 * ex: `Northeast` for Direction.Northeast, or `South North` for directionToName(Direction.North | Direction.South,' ')
 */
export function directionToName(
  direction: Direction,
  seperator: string | null = null,
): string {
  switch (direction) {
    case null:
      return 'Center';
    case Direction.Center:
      return 'Center';
    case Direction.Northwest:
      return 'Northwest';
    case Direction.North:
      return 'North';
    case Direction.Northeast:
      return 'Northeast';
    case Direction.West:
      return 'West';
    case Direction.East:
      return 'East';
    case Direction.Southwest:
      return 'Southwest';
    case Direction.South:
      return 'South';
    case Direction.Southeast:
      return 'Southeast';
    default:
      if (!seperator) {
        throw new Error(`Failed to convert ${direction} to direction symbol`);
      }

      return directionSplit(direction)
        .map((dir) => directionToName(dir, null))
        .join(seperator);
  }
}

/**
 * Converts the given direction into its initials, if the
 * direction is a multi direction, a seperator must be specified
 *
 * @param direction An enum used to represent the directions
 * @param seperator A string used to combine the symbol text
 * @returns An initial, or initials representing the direction.
 * ex: `NE` for `directionToInitial(Direction.Northeast)`, or `S N` for `directionToInitial(Direction.North | Direction.South, ' ')`
 */
export function directionToInitial(
  direction: Direction,
  seperator: string | null = null,
): string {
  switch (direction) {
    case null:
      return 'C';
    case Direction.Center:
      return 'C';
    case Direction.Northwest:
      return 'NW';
    case Direction.North:
      return 'N';
    case Direction.Northeast:
      return 'NE';
    case Direction.West:
      return 'W';
    case Direction.East:
      return 'E';
    case Direction.Southwest:
      return 'SW';
    case Direction.South:
      return 'S';
    case Direction.Southeast:
      return 'SE';
    default:
      if (!seperator) {
        throw new Error(`Failed to convert ${direction} to direction initial`);
      }

      return directionSplit(direction)
        .map((dir) => directionToInitial(dir, null))
        .join(seperator);
  }
}

/**
 * Checks if direction contains all mutli directions in contains
 *
 * @param direction The direction to check
 * @param contains The direction that must be in direction
 * @returns True if all directions in contains are in direction
 */
export function directionHasAll(direction: Direction, contains: Direction) {
  return (direction & contains) === contains;
}

/**
 * Checks if direction contains any direcion in contains
 *
 * @param direction The direction to check
 * @param contains The direction that must overlap with direction
 * @returns True if any directions in contains are in direction
 */
export function directionHasAny(direction: Direction, contains: Direction) {
  return (direction & contains) > 0;
}

/**
 * Converts the given direction into its symbols, if the
 * direction is a multi direction, a seperator must be specified
 *
 * @param direction An enum used to represent the directions
 * @param seperator A string used to combine the symbol text
 * @returns A symbol, or symbols representing the direction.
 * ex: `↗` for `directionToSymbol(Direction.Northeast)`, or `↓ ↑` for `directionToSymbol(Direction.North | Direction.South,' ')`
 */
export function directionToSymbol(
  direction: Direction,
  seperator: string | null = null,
): string {
  switch (direction) {
    case null:
      return '✧';
    case Direction.Center:
      return '✧';
    case Direction.Northwest:
      return '↖';
    case Direction.North:
      return '↑';
    case Direction.Northeast:
      return '↗';
    case Direction.West:
      return '←';
    case Direction.East:
      return '→';
    case Direction.Southwest:
      return '↙';
    case Direction.South:
      return '↓';
    case Direction.Southeast:
      return '↘';
    default:
      if (seperator === null) {
        throw new Error(`Failed to convert ${direction} to direction symbol`);
      }

      return directionSplit(direction)
        .map((dir) => directionToSymbol(dir, null))
        .join(seperator);
  }
}

/**
 * Converts the given text into a single, or multi direction
 *
 * @param directionText A strin representing the direction.
 * Examples: `N`, `North`
 * @param seperator A string used to seperate the direction text.
 * @returns A direction, or combined direction, or null if it could not be parsed
 */
export function directionFromText(
  directionText: string,
  seperator: string | null = null,
): Direction | null {
  if (!directionText) return null;
  directionText = directionText.toUpperCase();
  switch (directionText) {
    case 'C':
      return Direction.Center;
    case 'NW':
      return Direction.Northwest;
    case 'N':
      return Direction.North;
    case 'NE':
      return Direction.Northeast;
    case 'W':
      return Direction.West;
    case 'E':
      return Direction.East;
    case 'SW':
      return Direction.Southwest;
    case 'S':
      return Direction.South;
    case 'SE':
      return Direction.Southeast;
    case 'CENTER':
      return Direction.Center;
    case 'NORTHWEST':
      return Direction.Northwest;
    case 'NORTH':
      return Direction.North;
    case 'NORTHEAST':
      return Direction.Northeast;
    case 'WEST':
      return Direction.West;
    case 'EAST':
      return Direction.East;
    case 'SOUTHWEST':
      return Direction.Southwest;
    case 'SOUTH':
      return Direction.South;
    case 'SOUTHEAST':
      return Direction.Southeast;
    case '✧':
      return Direction.Center;
    case '↖':
      return Direction.Northwest;
    case '↑':
      return Direction.North;
    case '↗':
      return Direction.Northeast;
    case '←':
      return Direction.West;
    case '→':
      return Direction.East;
    case '↙':
      return Direction.Southwest;
    case '↓':
      return Direction.South;
    case '↘':
      return Direction.Southeast;
    default:
      if (!seperator) return null;
      return directionText
        .split(seperator)
        .map((dirT) => directionFromText(dirT, seperator) ?? Direction.Center)
        .reduce((last, curr) => last | curr);
  }
}
/**
 * Converts a single direction to an offset.
 *
 * @param direction An enum to convert to an offset
 * @returns An offset. ex: Northwest is `{ x: -1, y: -1 }`
 */
export function directionToOffset(direction: Direction): {
  x: number;
  y: number;
} {
  switch (direction) {
    case null:
      return { x: 0, y: 0 };
    case Direction.Center:
      return { x: 0, y: 0 };
    case Direction.Northwest:
      return { x: -1, y: -1 };
    case Direction.North:
      return { x: 0, y: -1 };
    case Direction.Northeast:
      return { x: 1, y: -1 };
    case Direction.West:
      return { x: -1, y: 0 };
    case Direction.East:
      return { x: 1, y: 0 };
    case Direction.Southwest:
      return { x: -1, y: 1 };
    case Direction.South:
      return { x: 0, y: 1 };
    case Direction.Southeast:
      return { x: 1, y: 1 };
    default:
      throw new Error(`Failed to convert ${direction} into a position`);
  }
}

/**
 * Converts an offset into a single direction
 *
 * @param offsetX The x offset from zero
 * @param offsetY The y offset from zero
 * @returns A direction
 */
export function directionFromOffset(
  offsetX: number,
  offsetY: number,
): Direction {
  if (offsetX > 0) {
    if (offsetY > 0) return Direction.Southeast;
    if (offsetY < 0) return Direction.Northeast;
    return Direction.East;
  }
  if (offsetX < 0) {
    if (offsetY > 0) return Direction.Southwest;
    if (offsetY < 0) return Direction.Northwest;
    return Direction.West;
  }
  if (offsetY > 0) return Direction.South;
  if (offsetY < 0) return Direction.North;
  return Direction.Center;
}

/**
 * Replaces the single direction if it is diagonal, with west, or east depending on what is closer
 *
 * @param direction A single direction to convert to a cardinal single direction
 */
export function directionDiagonalToWestEast(direction: Direction): Direction {
  switch (direction) {
    case Direction.Northwest:
      return Direction.West;
    case Direction.Northeast:
      return Direction.East;
    case Direction.Southwest:
      return Direction.West;
    case Direction.Southeast:
      return Direction.East;
    default:
      return direction;
  }
}

/**
 * Returns an array of each direction, skips center
 */
export function directionList() {
  return [
    Direction.Northwest,
    Direction.North,
    Direction.Northeast,
    Direction.West,
    Direction.East,
    Direction.Southwest,
    Direction.South,
    Direction.Southeast,
  ];
}
