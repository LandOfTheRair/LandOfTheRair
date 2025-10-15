import type {
  IItemDefinition,
  INPCDefinition,
  IRNGDungeonMetaConfig,
  ISpawnerData,
  ISpoilerLog,
  ItemClassType,
  Rollable,
} from '@lotr/interfaces';
import { ItemClass } from '@lotr/interfaces';
import { Injectable } from 'injection-js';
import { sample } from 'lodash';

import {
  coreChallenge,
  coreRNGDungeonConfig,
  coreSpriteInfo,
  droptableCustomMapAdd,
  itemCustomAdd,
  itemCustomClearMap,
  itemGetMatchingName,
  npcCustomAdd,
  npcCustomClearMap,
  spawnerCustomAdd,
  spawnerCustomClearMap,
} from '@lotr/content';
import { consoleError, consoleLog } from '@lotr/logger';
import { BaseService } from '../../models/BaseService';
import { MapGenerator } from './helpers/MapGenerator';

@Injectable()
export class RNGDungeonGenerator extends BaseService {
  private spoilerLogs: Record<string, ISpoilerLog[]> = {};
  private playersClaimedToday: Record<string, Record<string, boolean>> = {};

  public init() {}

  // generate the whole-ass dungeon!
  public generateDungeon(map: IRNGDungeonMetaConfig, seed?: number) {
    const config = coreRNGDungeonConfig();

    const defaultDungeon = this.game.worldManager.getMap('RNGTemplate100');

    if (!defaultDungeon || !defaultDungeon.map) {
      consoleError(
        'RNGDungeonGenerator',
        new Error('Could not find default dungeon template.'),
      );
      return;
    }

    const defaultSeed =
      map.name
        .split('')
        .map((c) => c.charCodeAt(0))
        .reduce((a, b) => a + b, 0) + +this.game.dailyHelper.resetTime;
    seed ??= defaultSeed;

    consoleLog(
      'RNGDungeonGenerator',
      `Today's seed for ${map.name}: "${seed}"`,
    );

    const validRuneScrolls = itemGetMatchingName('Rune Scroll -')
      // filter out holiday scrolls
      .filter((f) => !f.binds)
      .filter((f) => (f.trait?.level ?? 0) <= map.itemProps.maxTraitLevel)
      .filter(
        (f) =>
          (f.requirements?.level ?? 0) >= map.itemProps.minTraitScrollLevel &&
          (f.requirements?.level ?? 0) <= map.itemProps.maxTraitScrollLevel,
      );
    const generator = new MapGenerator(
      map,
      defaultDungeon.map.tiledJSON,
      seed,
      config,
      coreChallenge(),
      coreSpriteInfo(),
      itemGetMatchingName(map.name).concat(validRuneScrolls),
    );

    const { mapJSON, creatures, spawners, items, mapDroptable } =
      generator.generateBaseMap();

    const spoilerLog = generator.finalSpoilerLog;
    this.updateSpoilerLog(map.name, spoilerLog);

    this.updateMapDroptable(map.name, mapDroptable);
    this.updateItems(map.name, items);
    this.updateCreatures(map.name, creatures.flat());
    this.updateSpawners(map.name, spawners.flat());

    this.updateMap(map.name, mapJSON);
  }

  // updating the map info, file, and the content for the game
  private async updateMap(mapName: string, mapJSON: any) {
    const mapData = this.game.worldManager.getMap(mapName);
    mapData?.state?.removeAllNPCs();

    await this.game.groundManager.removeGround(mapName);
    this.game.worldManager.createOrReplaceMap(mapName, mapJSON);
    this.playersClaimedToday[mapName] = {};
  }

  private updateMapDroptable(mapName: string, droptable: Rollable[]) {
    droptableCustomMapAdd(mapName, droptable);
  }

  private updateItems(mapName: string, items: IItemDefinition[]) {
    itemCustomClearMap(mapName);
    items.forEach((item) => itemCustomAdd(mapName, item));
  }

  private updateCreatures(mapName: string, creatures: INPCDefinition[]) {
    npcCustomClearMap(mapName);
    creatures.forEach((creature) => npcCustomAdd(mapName, creature));
  }

  private updateSpawners(mapName: string, spawners: ISpawnerData[]) {
    spawnerCustomClearMap(mapName);
    spawners.forEach((spawner) =>
      spawnerCustomAdd(mapName, spawner.tag, spawner),
    );
  }

  // spoiler log related
  private updateSpoilerLog(mapName: string, spoilerLog: ISpoilerLog[]): void {
    this.spoilerLogs[mapName] = spoilerLog;
  }

  public getSpoilerLog(mapName: string): ISpoilerLog[] {
    return this.spoilerLogs[mapName];
  }

  // player daily treasure claims
  public hasClaimed(mapName: string, playerUUID: string): boolean {
    return this.playersClaimedToday[mapName]?.[playerUUID];
  }

  public claim(mapName: string, playerUUID: string): void {
    this.playersClaimedToday[mapName] = this.playersClaimedToday[mapName] ?? {};
    this.playersClaimedToday[mapName][playerUUID] = true;
  }

  public getRandomItemFromMap(
    mapName: string,
    type: 'weapon' | 'armor' | 'jewelry' | 'gem',
    keywordMatches: string[] = [],
  ): IItemDefinition | undefined {
    let itemClasses: ItemClassType[] = [];

    if (type === 'weapon') {
      itemClasses = [
        ItemClass.Axe,
        ItemClass.Broadsword,
        ItemClass.Club,
        ItemClass.Crossbow,
        ItemClass.Dagger,
        ItemClass.Flail,
        ItemClass.Greataxe,
        ItemClass.Greatmace,
        ItemClass.Greatsword,
        ItemClass.Halberd,
        ItemClass.Hammer,
        ItemClass.Longbow,
        ItemClass.Longsword,
        ItemClass.Mace,
        ItemClass.Saucer,
        ItemClass.Shield,
        ItemClass.Shortbow,
        ItemClass.Shortsword,
        ItemClass.Spear,
        ItemClass.Staff,
        ItemClass.Sword,
        ItemClass.Totem,
        ItemClass.Wand,
      ];
    }

    if (type === 'armor') {
      itemClasses = [
        ItemClass.Amulet,
        ItemClass.Bracers,
        ItemClass.Boots,
        ItemClass.Breastplate,
        ItemClass.Claws,
        ItemClass.Cloak,
        ItemClass.Fullplate,
        ItemClass.Fur,
        ItemClass.Gloves,
        ItemClass.Hat,
        ItemClass.Helm,
        ItemClass.Robe,
        ItemClass.Sash,
        ItemClass.Scale,
        ItemClass.Tunic,
        ItemClass.Shield,
        ItemClass.Saucer,
      ];
    }

    if (type === 'jewelry') {
      itemClasses = [ItemClass.Earring, ItemClass.Ring, ItemClass.Amulet];
    }

    if (type === 'gem') itemClasses = [ItemClass.Gem];

    const validItems = itemGetMatchingName(mapName)
      .filter((x) =>
        keywordMatches.length > 0
          ? keywordMatches.some((k) => x.name.includes(k))
          : true,
      )
      .filter((x) => itemClasses.includes(x.itemClass) && x.sprite !== -1);

    const item = sample(validItems);

    return item;
  }
}
