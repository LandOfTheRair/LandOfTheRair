
/* eslint-disable no-bitwise */

import * as _ from 'lodash';
import * as DirFuncs from '../direction';
import { Direction } from '../../interfaces';

test('check all directions can be converted to name, and back', () => {
  DirFuncs.directionList().forEach(dir => {
    expect(_.flow(DirFuncs.directionToName, DirFuncs.directionFromText)(dir)).toBe(dir);
  });
});

test('check all directions can be converted to initial, and back', () => {
  DirFuncs.directionList().forEach(dir => {
    expect(_.flow(DirFuncs.directionToInitial, DirFuncs.directionFromText)(dir)).toBe(dir);
  });
});

test('check all directions can be converted to symbol, and back', () => {
  DirFuncs.directionList().forEach(dir => {
    expect(_.flow(DirFuncs.directionToSymbol, DirFuncs.directionFromText)(dir)).toBe(dir);
  });
});

test('check all directions can be offset, and back', () => {
  DirFuncs.directionList().forEach(dir => {
    expect(_.flow(DirFuncs.directionToOffset, (offset) => DirFuncs.directionFromOffset(offset.x, offset.y))(dir)).toBe(dir);
  });
});

test('join all the directions, and split them again', () => {
  const dirs = DirFuncs.directionList();
  const combined = dirs.reduce((prev, curr) => prev | curr, Direction.Center);
  const split = DirFuncs.directionSplit(combined);
  expect(split.sort()).toStrictEqual(dirs.sort());
});

test('convert diaganals to east, or west', () => {
  const dirs = [Direction.Northeast, Direction.Southeast, Direction.Northwest, Direction.Southwest];
  const converted = dirs.map((dir) => DirFuncs.directionDiaganalToWestEast(dir));
  expect(converted).toStrictEqual([Direction.East, Direction.East, Direction.West, Direction.West]);
});
