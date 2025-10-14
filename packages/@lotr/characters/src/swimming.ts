import { DamageClass, SwimLevel } from '@lotr/interfaces';

// mapping of sprite row -> relevant info
const SwimInfo: Record<number, { element: DamageClass; swimLevel: SwimLevel }> =
  {
    1: { element: DamageClass.Water, swimLevel: SwimLevel.SpringWater },
    8: { element: DamageClass.Water, swimLevel: SwimLevel.NormalWater },
    9: { element: DamageClass.Fire, swimLevel: SwimLevel.Lava },
    16: { element: DamageClass.Water, swimLevel: SwimLevel.ChillWater },
  };

export function swimLevelGet(gid: number) {
  if (
    (gid >= 2288 && gid <= 2296) ||
    gid === 2200 ||
    gid === 2216 ||
    (gid >= 2304 && gid <= 2312)
  ) {
    return SwimInfo[1];
  }
  return SwimInfo[Math.floor((gid - 1) / 48)];
}
