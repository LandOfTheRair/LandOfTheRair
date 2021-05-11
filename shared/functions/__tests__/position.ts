import * as PosFunc from '../position';
import { IPosition } from '../../interfaces/position';

test('generates 25 positions with range 2', () => {
  const positions: Array<IPosition> = [];
  PosFunc.positionInRange({ x: 0, y: 0 }, 2, (pos) => positions.push(pos));
  expect(positions.length).toBe(25);
});
