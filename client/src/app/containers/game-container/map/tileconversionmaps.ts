
// 2388 - vertical cave wall
// 2399 - horizontal cave wall

import { invert } from 'lodash';

export const VerticalDoorGids = {

  // blue wall door vert
  1058: true,

  // undead wall door vert
  1065: true,

  // cave wall door vert
  1070: true,

  // stone wall door vert
  1077: true,

  // green wall door vert
  1088: true,

  // town door vert
  1095: true,

  // town2 door vert
  1116: true,

  // town3 door vert
  1123: true,

  // cave green wall door vert
  1211: true

};

export const TrueSightMap = {

  // blue wall horiz, blue wall vert
  14: 1064,
  15: 1065,

  // cave horiz, cave vert
  62: 1076,
  63: 1075,

  // stone horiz, stone vert
  78: 1087,
  79: 1086,

  // green stone horiz, green stone vert
  94: 1094,
  95: 1093,

  // town horiz, town vert
  111: 1100,
  112: 1101,

  // town2 horiz, town2 vert
  175: 1123,
  176: 1124,

  // green cave wall horiz, green cave wall vert
  350: 1217,
  351: 1216
};

export const TrueSightMapReversed = invert(TrueSightMap);
