

import { Injectable } from 'injection-js';

import { DamageClass, SwimLevel } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

const WOOD_PILE_DESC = 'You are standing near a pile of logs, stacked neatly so as not to trounce an unsuspecting passerby.';
const WOOD_SEAT_DESC = 'You are sitting in a somewhat uncomfortable wooden seat.';
const WATER_BARREL_DESC = 'You are standing near a keg. Who know\'s what\'s inside?';
const HAY_DESC = 'You are standing on a bale of hay.';
const WATER_DESC = 'You are standing near a water trough.';
const WATER_DESC_BROKEN = `${WATER_DESC} It\'s leaking everywhere.`;
const FURNACE_DESC = 'You are standing near a furnace. It is hot.';
const WEAPON_RACK_DESC = 'You are standing near a rack of weapons. They look very pointy.';
const ARMOR_STATUE_DESC = 'You are standing near a suit of armor.';
const COFFIN_DESC = 'You are standing near a coffin. You\'re concerned that something might jump out to scare you.';
const LOCKER_DESC = 'You are standing near a wardrobe. Every time you touch it, it feels warm and strangely familiar.';
const STONE_BRIDGE_DESC = 'You are standing on a bridge made of stone.';
const WOOD_BRIDGE_DESC = 'You are standing on a bridge fashioned out of a fallen tree.';
const WATER_PUDDLE_DESC = 'You are standing in a puddle.';
const SLUDGE_PUDDLE_DESC = 'You are standing in some sludge. Eww.';
const BLOOD_PUDDLE_DESC = 'You are standing in a puddle of blood.';
const ORNATE_RUG_DESC = 'You are standing on an ornate rug.';
const STYLISH_RUG_DESC = 'You are standing on a stylish rug.';

const DecorGids = {
  172: WOOD_PILE_DESC,
  173: WOOD_PILE_DESC,
  174: WOOD_PILE_DESC,
  175: WOOD_PILE_DESC,

  176: WOOD_SEAT_DESC,
  177: WOOD_SEAT_DESC,
  178: WOOD_SEAT_DESC,
  179: WOOD_SEAT_DESC,

  184: WATER_BARREL_DESC,
  185: WATER_BARREL_DESC,
  186: WATER_BARREL_DESC,
  187: WATER_BARREL_DESC,

  192: HAY_DESC,
  193: HAY_DESC,
  194: HAY_DESC,
  195: HAY_DESC,

  196: WATER_DESC,
  197: WATER_DESC,
  198: WATER_DESC_BROKEN,
  199: WATER_DESC_BROKEN,

  200: FURNACE_DESC,
  201: FURNACE_DESC,
  202: FURNACE_DESC,
  203: FURNACE_DESC,

  204: WEAPON_RACK_DESC,
  205: WEAPON_RACK_DESC,
  206: WEAPON_RACK_DESC,
  207: WEAPON_RACK_DESC,

  208: ARMOR_STATUE_DESC,
  209: ARMOR_STATUE_DESC,
  210: ARMOR_STATUE_DESC,
  211: ARMOR_STATUE_DESC,

  212: COFFIN_DESC,
  213: COFFIN_DESC,
  214: COFFIN_DESC,
  215: COFFIN_DESC,

  216: LOCKER_DESC,
  217: LOCKER_DESC,
  218: LOCKER_DESC,
  219: LOCKER_DESC,

  556: ORNATE_RUG_DESC,
  557: ORNATE_RUG_DESC,
  558: ORNATE_RUG_DESC,
  559: ORNATE_RUG_DESC,
  560: ORNATE_RUG_DESC,
  561: ORNATE_RUG_DESC,
  562: ORNATE_RUG_DESC,
  563: ORNATE_RUG_DESC,
  564: ORNATE_RUG_DESC,

  565: STYLISH_RUG_DESC,
  566: STYLISH_RUG_DESC,
  567: STYLISH_RUG_DESC,
  568: STYLISH_RUG_DESC,
  569: STYLISH_RUG_DESC,
  570: STYLISH_RUG_DESC,
  571: STYLISH_RUG_DESC,
  572: STYLISH_RUG_DESC,
  573: STYLISH_RUG_DESC,

  597: ORNATE_RUG_DESC,
  598: ORNATE_RUG_DESC,
  599: ORNATE_RUG_DESC,
  600: ORNATE_RUG_DESC,
  601: ORNATE_RUG_DESC,
  602: ORNATE_RUG_DESC,
  603: ORNATE_RUG_DESC,
  604: ORNATE_RUG_DESC,
  605: ORNATE_RUG_DESC,

  606: STYLISH_RUG_DESC,
  607: STYLISH_RUG_DESC,
  608: STYLISH_RUG_DESC,
  609: STYLISH_RUG_DESC,
  610: STYLISH_RUG_DESC,
  611: STYLISH_RUG_DESC,
  612: STYLISH_RUG_DESC,
  613: STYLISH_RUG_DESC,
  614: STYLISH_RUG_DESC,

  862: STONE_BRIDGE_DESC,
  863: STONE_BRIDGE_DESC,
  864: STONE_BRIDGE_DESC,
  865: STONE_BRIDGE_DESC,
  866: STONE_BRIDGE_DESC,

  867: WOOD_BRIDGE_DESC,
  868: WOOD_BRIDGE_DESC,
  869: WOOD_BRIDGE_DESC,
  870: WOOD_BRIDGE_DESC,
  871: WOOD_BRIDGE_DESC,
  872: WOOD_BRIDGE_DESC,

  874: 'You are standing on a net. Don\'t get stuck, now.',
  875: 'You are standing near an empty metal bucket.',
  876: 'You are standing near a cauldron full of primordial ooze, or at least that\'s how it smells. Yuck.',
  877: 'You are standing near a wooden barrel full of who-knows-what.',
  878: 'You are standing near a pyre. As you can imagine, it\'s hot. You should probably be taking fire damage right now.',
  879: 'You are standing near a gigantic bag of flour. Too bad alchemy uses flower, not flour.',
  880: 'You are standing near an anvil. You are briefly reminded of a wily coyote.',
  881: 'You are standing near a pillar.',
  882: 'You are standing on a wooden table. Get off that.',
  883: 'You are standing near an alchemy table. Be careful what you mix together here lest it blow up.',
  884: 'You are standing on what probably was a bale of hay. Soft enough to take a nap!',
  885: 'You are standing near a pile of books and scrolls. Someone made a mess of this.',
  886: 'You are standing on some rocks. If you\'re not careful, you\'ll fall and spill your gold everywhere.',
  894: 'You are standing near a blackjack table. Hit me!',
  895: 'You are standing near a roulette table. All on black!',

  946: WATER_PUDDLE_DESC,
  947: WATER_PUDDLE_DESC,
  948: WATER_PUDDLE_DESC,
  949: WATER_PUDDLE_DESC,
  950: WATER_PUDDLE_DESC,
  951: WATER_PUDDLE_DESC,

  952: SLUDGE_PUDDLE_DESC,
  953: SLUDGE_PUDDLE_DESC,
  954: SLUDGE_PUDDLE_DESC,
  955: SLUDGE_PUDDLE_DESC,
  956: SLUDGE_PUDDLE_DESC,
  957: SLUDGE_PUDDLE_DESC,

  958: BLOOD_PUDDLE_DESC,
  959: BLOOD_PUDDLE_DESC,
  960: BLOOD_PUDDLE_DESC,
  961: BLOOD_PUDDLE_DESC,
  962: BLOOD_PUDDLE_DESC
};

// mapping of sprite row -> relevant info
const SwimInfo: Record<number, { element: DamageClass, swimLevel: SwimLevel }> = {
  1:  { element: DamageClass.Water, swimLevel: SwimLevel.SpringWater },
  8:  { element: DamageClass.Water, swimLevel: SwimLevel.NormalWater },
  9:  { element: DamageClass.Fire,  swimLevel: SwimLevel.Lava },
  16: { element: DamageClass.Water, swimLevel: SwimLevel.ChillWater }
};

export const GetSwimLevel = (gid) => {
  if (gid >= 2288 && gid <= 2296 || gid === 2200) return SwimInfo[1];
  return SwimInfo[Math.floor((gid - 1) / 48)];
};

const DESCS = [
  'You are standing on darkened cobblestone.',
  'You are standing in sand.',
  'You are standing on finely-polished tile.',
  'You are standing on a finished wooden floor.',
  'You are standing in fire.',
  'You are standing in a thick, black ooze. Eww.',
  'You are standing in a thin mist.',
  'You are standing on a pile of treasure.',
  'You are swimming in water.',
  'You are swimming in lava.',
  'You are standing in a thick, acrid mist. It is hard to breathe.',
  'You are standing on a pile of unidentifiable bones.',
  'You are standing on grass.',
  'You are standing near a hole.',
  'You are standing on cobblestone.',
  'You are standing in snow.',
  'You are swimming in chilly water.',
  'You are standing in flowery grass.',
  'You are standing knee-deep in weeds and bog flowers.',
  'You are standing on dirt.'
];

const GID_TERRAIN_END = 960;
const GID_DECOR_START = 1329;

@Injectable()
export class StaticTextHelper extends BaseService {

  public init() {}

  getGidDescription(gid: number) {
    if (!gid) return '';

    // terrain
    if (gid <= GID_TERRAIN_END) return DESCS[Math.floor((gid - 1) / 48)];

    // decor
    if (gid > GID_DECOR_START) {
      return DecorGids[gid - GID_DECOR_START];
    }

    // whatever
    return '';
  }
}
