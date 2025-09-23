/* eslint-disable no-bitwise */

import * as _ from 'lodash';
import { describe, expect, it } from 'vitest';
import { Direction } from '../interfaces';
import * as DirFuncs from './direction';

describe('Direction Functions', () => {
  it('should convert all directions to name and back', () => {
    DirFuncs.directionList().forEach((dir) => {
      expect(
        _.flow(DirFuncs.directionToName, DirFuncs.directionFromText)(dir),
      ).toBe(dir);
    });
  });

  it('should convert all directions to initial and back', () => {
    DirFuncs.directionList().forEach((dir) => {
      expect(
        _.flow(DirFuncs.directionToInitial, DirFuncs.directionFromText)(dir),
      ).toBe(dir);
    });
  });

  it('should convert all directions to symbol and back', () => {
    DirFuncs.directionList().forEach((dir) => {
      expect(
        _.flow(DirFuncs.directionToSymbol, DirFuncs.directionFromText)(dir),
      ).toBe(dir);
    });
  });

  it('should convert all directions to offset and back', () => {
    DirFuncs.directionList().forEach((dir) => {
      expect(
        _.flow(DirFuncs.directionToOffset, (offset) =>
          DirFuncs.directionFromOffset(offset.x, offset.y),
        )(dir),
      ).toBe(dir);
    });
  });

  it('should join all directions and split them again', () => {
    const dirs = DirFuncs.directionList();
    const combined = dirs.reduce((prev, curr) => prev | curr, Direction.Center);
    const split = DirFuncs.directionSplit(combined);
    expect(split.sort()).toStrictEqual(dirs.sort());
  });

  it('should convert diagonals to east or west', () => {
    const dirs = [
      Direction.Northeast,
      Direction.Southeast,
      Direction.Northwest,
      Direction.Southwest,
    ];
    const converted = dirs.map((dir) =>
      DirFuncs.directionDiagonalToWestEast(dir),
    );
    expect(converted).toStrictEqual([
      Direction.East,
      Direction.East,
      Direction.West,
      Direction.West,
    ]);
  });
});
