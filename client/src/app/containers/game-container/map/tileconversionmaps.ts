
// 2388 - vertical cave wall
// 2399 - horizontal cave wall

import { invert } from 'lodash';
import tileConversionMaps from '../../../../assets/content/_output/tileconversionmaps.json';

export const VerticalDoorGids = tileConversionMaps.verticalDoorGids;

export const TrueSightMap = tileConversionMaps.truesightMap;

export const TrueSightMapReversed = invert(TrueSightMap);
