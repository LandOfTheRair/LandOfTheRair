import { coreStaticText } from './core';

let decor: Record<number, string> = {};
let terrain: Record<number, string> = {};

const GID_TERRAIN_END = 960;
const GID_DECOR_START = 1329;

export function textLoadForGame() {
  const allText = coreStaticText();
  decor = allText.decor || {};
  terrain = allText.terrain || [];
}

export function textGidDescriptionGet(gid: number) {
  if (!gid) return '';

  // terrain
  if (gid <= GID_TERRAIN_END) {
    return terrain[Math.floor((gid - 1) / 48)] ?? '';
  }

  // decor
  if (gid > GID_DECOR_START) {
    return decor[gid - GID_DECOR_START] ?? '';
  }

  // whatever
  return '';
}
