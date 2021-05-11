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

/**
 * Converts a tile position into a new world position
 */
export function positionTileToWorld(position: IPosition): IPosition {
  return { x: position.x * 64 + 32, y: position.y * 64 + 32 };
}

/**
 * Converts a world position into a new tile position
 */
export function positionWorldXYToTile({ worldX, worldY }: {worldX: number; worldY: number}) {
  return positionWorldToTile({ x: worldX, y: worldY });
}

/**
 * Sets the receivers x, and y to position x, and y
 */
export function positionSetXY(receiver: IPosition, position: IPosition) {
  receiver.x = position.x;
  receiver.y = position.y;
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

/**
 * Calls a method for each position in range of a given center
 *
 * @param center The center position
 * @param range The range around the position
 * @param method The method to call for each position in range
 */
export function positionInRange(center: IPosition, range: number, method: (position: IPosition) => void) {
  for (let i = center.x - range; i <= center.x + range; i++) {
    for (let j = center.y - range; j <= center.y + range; j++) {
      method({ x: i, y: j });
    }
  }
}
