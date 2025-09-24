import fs from 'fs-extra';
import { Injectable } from 'injection-js';

import {
  IItemDefinition,
  IModKit,
  INPCDefinition,
  INPCScript,
  IQuest,
  IRecipe,
  ISpawnerData,
  Rollable,
} from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class ModKitManager extends BaseService {
  private itemsLoadedHash: Record<string, Record<string, boolean>> = {};

  private npcs: INPCDefinition[] = [];
  private spawners: ISpawnerData[] = [];
  private items: IItemDefinition[] = [];
  private mapDrops: Array<{ mapName: string; drops: Rollable[] }> = [];
  private regionDrops: Array<{ regionName: string; drops: Rollable[] }> = [];
  private npcScripts: INPCScript[] = [];
  private quests: IQuest[] = [];
  private recipes: IRecipe[] = [];

  public get modNPCs(): INPCDefinition[] {
    return this.npcs;
  }

  public get modSpawners(): ISpawnerData[] {
    return this.spawners;
  }

  public get modItems(): IItemDefinition[] {
    return this.items;
  }

  public get modMapDrops(): Array<{ mapName: string; drops: Rollable[] }> {
    return this.mapDrops;
  }

  public get modRegionDrops(): Array<{
    regionName: string;
    drops: Rollable[];
  }> {
    return this.regionDrops;
  }

  public get modNPCScripts(): INPCScript[] {
    return this.npcScripts;
  }

  public get modQuests(): IQuest[] {
    return this.quests;
  }

  public get modRecipes(): IRecipe[] {
    return this.recipes;
  }

  public get loadMods(): string[] {
    return process.env.MODS_TO_LOAD
      ? (process.env.MODS_TO_LOAD || '').split(',').map((x) => x.trim())
      : [];
  }

  public async init() {
    await fs.ensureDir('content/mods');
    await fs.ensureDir('content/maps');

    this.copyModsFromList();

    if (fs.existsSync('content/maps/custom')) {
      fs.rmSync('content/maps/custom', { recursive: true });
    }

    await fs.ensureDir('content/maps/custom');

    this.loadModsFromList();
  }

  private copyModsFromList() {
    const mods = this.loadMods;

    mods.forEach((mod) => {
      if (!fs.existsSync(`CommunityMods/mods/${mod}.rairmod`)) {
        this.game.logger.error(
          'ModKit:CopyModsFromList',
          new Error(
            `Mod "${mod}" does not exist, skipping copy step from CommunityMods...`,
          ),
        );
        return;
      }

      fs.copySync(
        `CommunityMods/mods/${mod}.rairmod`,
        `content/mods/${mod}.rairmod`,
      );
    });
  }

  private loadModsFromList() {
    const mods = this.loadMods;

    this.game.logger.log('ModKit:Init', `Loading ${mods.length} mods...`);

    mods.forEach((mod) => {
      if (!fs.existsSync(`content/mods/${mod}.rairmod`)) {
        this.game.logger.error(
          'ModKit:LoadModsFromList',
          new Error(
            `Mod "${mod}" does not exist, skipping load step from content...`,
          ),
        );
        return;
      }

      const actualMod = fs.readJSONSync(`content/mods/${mod}.rairmod`);
      this.loadMod(actualMod);
    });
  }

  private loadMod(mod: IModKit) {
    this.game.logger.log(
      'ModKit:Loader',
      `Loading ${mod.meta.name} by ${mod.meta.author}...`,
    );

    let failedLoad = false;

    const loadMaps: any[] = [];
    const loadNPCs: INPCDefinition[] = [];
    const loadSpawners: ISpawnerData[] = [];
    const loadItems: IItemDefinition[] = [];
    const loadDrops: Array<{
      mapName?: string;
      regionName?: string;
      drops: Rollable[];
    }> = [];
    const loadDialogs: INPCScript[] = [];
    const loadQuests: IQuest[] = [];
    const loadRecipes: IRecipe[] = [];

    // items that can and must be deduped (if any of these fail, the mod will NOT load, and they will check again in the content manager)
    mod.maps.forEach((map) => {
      if (this.isLoaded('map', map.name)) {
        this.game.logger.warn(
          'ModKit:Loader',
          `Map ${map.name} already exists, skipping...`,
        );
        failedLoad = true;
        return;
      }

      this.markLoaded('map', map.name);

      loadMaps.push(map);
    });

    mod.npcs.forEach((npc) => {
      if (this.isLoaded('npc', npc.npcId)) {
        this.game.logger.warn(
          'ModKit:Loader',
          `NPC ${npc.npcId} already exists, skipping...`,
        );
        failedLoad = true;
        return;
      }

      this.markLoaded('npc', npc.npcId);

      loadNPCs.push(npc);
    });

    mod.spawners.forEach((spawner) => {
      if (this.isLoaded('spawner', spawner.tag)) {
        this.game.logger.warn(
          'ModKit:Loader',
          `Spawner ${spawner.tag} already exists, skipping...`,
        );
        failedLoad = true;
        return;
      }

      this.markLoaded('spawner', spawner.tag);

      loadSpawners.push(spawner);
    });

    mod.items.forEach((item) => {
      if (this.isLoaded('item', item.name)) {
        this.game.logger.warn(
          'ModKit:Loader',
          `Item ${item.name} already exists, skipping...`,
        );
        failedLoad = true;
        return;
      }

      this.markLoaded('item', item.name);

      loadItems.push(item);
    });

    mod.quests.forEach((quest) => {
      if (this.isLoaded('quest', quest.name)) {
        this.game.logger.warn(
          'ModKit:Loader',
          `Quest ${quest.name} already exists, skipping...`,
        );
        failedLoad = true;
        return;
      }

      this.markLoaded('quest', quest.name);

      loadQuests.push(quest);
    });

    mod.dialogs.forEach((dialog) => {
      if (this.isLoaded('dialog', dialog.tag)) {
        this.game.logger.warn(
          'ModKit:Loader',
          `NPC Script ${dialog.tag} already exists, skipping...`,
        );
        failedLoad = true;
        return;
      }

      this.markLoaded('dialog', dialog.tag);

      loadDialogs.push(dialog);
    });

    // items that cannot be deduped
    mod.drops.forEach((drop) => {
      loadDrops.push(drop);
    });

    mod.recipes.forEach((recipe) => {
      loadRecipes.push(recipe);
    });

    // if we fail, we bail
    if (failedLoad) {
      this.game.logger.warn(
        'ModKit:Loader',
        `Failed to load mod "${mod.meta.name}" by ${mod.meta.author}, skipping...`,
      );
      return;
    }

    // otherwise, we load everything how it needs to be
    loadMaps.forEach((map) => {
      fs.writeJSONSync(`content/maps/custom/${map.name}.json`, map.map);
    });

    // drops are handled differently
    this.mapDrops.push(
      ...(loadDrops.filter((x) => x.mapName) as Array<{
        mapName: string;
        drops: Rollable[];
      }>),
    );
    this.regionDrops.push(
      ...(loadDrops.filter((x) => x.regionName) as Array<{
        regionName: string;
        drops: Rollable[];
      }>),
    );

    this.npcs.push(...loadNPCs);
    this.spawners.push(...loadSpawners);
    this.items.push(...loadItems);
    this.npcScripts.push(...loadDialogs);
    this.quests.push(...loadQuests);
    this.recipes.push(...loadRecipes);
  }

  private isLoaded(type: string, key: string): boolean {
    return this.itemsLoadedHash[type]?.[key];
  }

  private markLoaded(type: string, key: string): void {
    this.itemsLoadedHash[type] = this.itemsLoadedHash[type] || {};
    this.itemsLoadedHash[type][key] = true;
  }
}
