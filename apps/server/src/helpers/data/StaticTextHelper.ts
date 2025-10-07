import { Injectable } from 'injection-js';

import { coreStaticText } from '@lotr/content';
import { DamageClass, SwimLevel } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

// mapping of sprite row -> relevant info
const SwimInfo: Record<number, { element: DamageClass; swimLevel: SwimLevel }> =
  {
    1: { element: DamageClass.Water, swimLevel: SwimLevel.SpringWater },
    8: { element: DamageClass.Water, swimLevel: SwimLevel.NormalWater },
    9: { element: DamageClass.Fire, swimLevel: SwimLevel.Lava },
    16: { element: DamageClass.Water, swimLevel: SwimLevel.ChillWater },
  };

export const GetSwimLevel = (gid) => {
  if (
    (gid >= 2288 && gid <= 2296) ||
    gid === 2200 ||
    gid === 2216 ||
    (gid >= 2304 && gid <= 2312)
  ) {
    return SwimInfo[1];
  }
  return SwimInfo[Math.floor((gid - 1) / 48)];
};

const GID_TERRAIN_END = 960;
const GID_DECOR_START = 1329;

@Injectable()
export class StaticTextHelper extends BaseService {
  private decorText = {};
  private terrainText: string[] = [];

  public init() {
    const allText = coreStaticText();
    this.decorText = allText.decor || {};
    this.terrainText = allText.terrain || [];
  }

  getGidDescription(gid: number) {
    if (!gid) return '';

    // terrain
    if (gid <= GID_TERRAIN_END) {
      return this.terrainText[Math.floor((gid - 1) / 48)];
    }

    // decor
    if (gid > GID_DECOR_START) {
      return this.decorText[gid - GID_DECOR_START];
    }

    // whatever
    return '';
  }
}
