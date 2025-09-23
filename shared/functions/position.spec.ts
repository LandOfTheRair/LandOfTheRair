import { describe, expect, it } from 'vitest';
import { IPosition } from '../interfaces/position';
import * as PosFunc from './position';

describe('Position Functions', () => {
  it('should generate 25 positions with range 2', () => {
    const positions: Array<IPosition> = [];
    PosFunc.positionInRange({ x: 0, y: 0 }, 2, (pos) => positions.push(pos));
    expect(positions.length).toBe(25);
  });
});
