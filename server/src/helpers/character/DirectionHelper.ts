
import { Injectable } from 'injection-js';

import { BaseService, Direction, ICharacter } from '../../interfaces';

@Injectable()
export class DirectionHelper extends BaseService {

  public init() {}

  // get a direction based on a diff of two others
  getDirBasedOnDiff(xDiff: number, yDiff: number): string {

    const checkX = Math.abs(xDiff);
    const checkY = Math.abs(yDiff);

    if (checkX >= checkY) {
      if (xDiff > 0) {
        return 'East';
      } else if (xDiff < 0) {
        return 'West';
      }

    } else if (checkY > checkX) {
      if (yDiff > 0) {
        return 'South';
      } else if (yDiff < 0) {
        return 'North';
      }
    }

    return 'South';
  }

  setDirBasedOnXYDiff(char: ICharacter, x: number, y: number) {
    if (x === 0 && y === 0) return;
    char.dir = this.getDirBasedOnDiff(x, y).substring(0, 1) as Direction;
  }

  setDirRelativeTo(me: ICharacter, target: ICharacter) {
    const diffX = target.x - me.x;
    const diffY = target.y - me.y;

    this.setDirBasedOnXYDiff(me, diffX, diffY);
  }

  getXYFromDir(dir: Direction) {
    const checkDir = dir.toUpperCase();
    switch (checkDir) {
      case Direction.North:     return { x: 0,   y: -1 };
      case Direction.East:      return { x: 1,   y: 0 };
      case Direction.South:     return { x: 0,   y: 1 };
      case Direction.West:      return { x: -1,  y: 0 };

      case Direction.Northwest: return { x: -1,  y: -1 };
      case Direction.Northeast: return { x: 1,   y: -1 };
      case Direction.Southwest: return { x: -1,  y: 1 };
      case Direction.Southeast: return { x: 1,   y: 1 };

      default:                  return { x: 0,   y: 0 };
    }
  }

  distFrom(refPoint: { x: number, y: number }, checkPoint: { x: number, y: number }, vector?: { x: number, y: number }): number {
    let checkX = refPoint.x;
    let checkY = refPoint.y;

    if (vector) {
      checkX += vector.x || 0;
      checkY += vector.y || 0;
    }

    return Math.floor(Math.sqrt(Math.pow(checkPoint.x - checkX, 2) + Math.pow(checkPoint.y - checkY, 2)));
  }

}
