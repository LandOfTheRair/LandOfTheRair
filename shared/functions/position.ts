import { Direction } from '../interfaces';
import { IPosition } from '../interfaces/position';

/**
 * Position in the format of `x y`
 */
export function positionText(position: IPosition) {
  return `${position.x} ${position.y}`;
}

/**
 * Number of tiles from `0 0`
 */
export function positionDistanceFromZero(position: IPosition): number {
  return Math.max(Math.abs(position.x), Math.abs(position.y));
}

/**
 * Difference between this and the given position
 *
 * @returns position1 - position2
 */
export function positionSubtract(position1: IPosition, position2: IPosition): IPosition {
  return { x: position1.x - position2.x, y: position1.y - position2.y };
}

/**
 * Add this and the given position
 *
 * @returns position1 + position2
 */
export function positionAdd(position1: IPosition, position2: IPosition): IPosition {
  return { x: position1.x + position2.x, y: position1.y + position2.y };
}

/**
 * Checks if position is at zero
 */
export function positionIsZero(position: IPosition): boolean {
  return position.x === 0 && position.y === 0;
}

/**
 * Converts a world position into a new tile position
 */
export function positionWorldToTile(position: IPosition): IPosition {
  return { x: Math.floor(position.x / 64), y: Math.floor(position.y / 64) };
}

export function positionWorldXYToTile({ worldX, worldY }: {worldX: number; worldY: number}) {
  return positionWorldToTile({ x: worldX, y: worldY });
}

const surrounding: readonly (IPosition & {direction: Direction})[] = [
  { x: -1, y: -1, direction: Direction.Northwest },
  { x: 0, y: -1, direction: Direction.North },
  { x: 1, y: -1, direction: Direction.Northeast },
  { x: -1, y: 0, direction: Direction.West },
  { x: 1, y: 0, direction: Direction.East },
  { x: -1, y: 1, direction: Direction.Southwest },
  { x: 0, y: 1, direction: Direction.South },
  { x: 1, y: 1, direction: Direction.Southeast }
];

/**
 * Returns an array of each surrounding position
 */
export function positionSurrounding(): readonly (IPosition & {direction: Direction})[] {
  return surrounding;
}
