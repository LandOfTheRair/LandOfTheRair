import * as PosFunc from '../position';
import { IPosition } from '../../interfaces/position';

test('generates 24 positions with range 2', () => {
  const positions: Array<IPosition> = [];
  PosFunc.positionInRangeAround({ x: 0, y: 0 }, 2, (pos) => positions.push(pos));
  expect(positions.length).toBe(24);
});
