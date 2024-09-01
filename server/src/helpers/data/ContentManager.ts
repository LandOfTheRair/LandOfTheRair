import childProcess from 'child_process';
import deepfreeze from 'deep-freeze';
import fs from 'fs-extra';
import { Injectable } from 'injection-js';
import { cloneDeep, get, isUndefined } from 'lodash';

import dl from 'download-github-repo';

import * as allegiancestats from '../../../content/_output/allegiancestats.json';
import * as attributestats from '../../../content/_output/attributestats.json';
import * as challenge from '../../../content/_output/challenge.json';
import * as charselect from '../../../content/_output/charselect.json';
import * as events from '../../../content/_output/events.json';
import * as fate from '../../../content/_output/fate.json';
import * as hidereductions from '../../../content/_output/hidereductions.json';
import * as holidaydescs from '../../../content/_output/holidaydescs.json';
import * as materialstorage from '../../../content/_output/materialstorage.json';
import * as npcnames from '../../../content/_output/npcnames.json';
import * as premium from '../../../content/_output/premium.json';
import * as rarespawns from '../../../content/_output/rarespawns.json';
import * as rngdungeonconfig from '../../../content/_output/rngdungeonconfig.json';
import * as settings from '../../../content/_output/settings.json';
import * as skilldescs from '../../../content/_output/skilldescs.json';
import * as spriteinfo from '../../../content/_output/sprite-data.json';
import * as statdamagemultipliers from '../../../content/_output/statdamagemultipliers.json';
import * as statictext from '../../../content/_output/statictext.json';
import * as weapontiers from '../../../content/_output/weapontiers.json';

import * as droptablesMaps from '../../../content/_output/droptable-maps.json';
import * as droptablesRegions from '../../../content/_output/droptable-regions.json';
import * as effectData from '../../../content/_output/effect-data.json';
import * as items from '../../../content/_output/items.json';
import * as npcScripts from '../../../content/_output/npc-scripts.json';
import * as npcs from '../../../content/_output/npcs.json';
import * as quests from '../../../content/_output/quests.json';
import * as recipes from '../../../content/_output/recipes.json';
import * as spawners from '../../../content/_output/spawners.json';
import * as spells from '../../../content/_output/spells.json';
import * as traitTrees from '../../../content/_output/trait-trees.json';
import * as traits from '../../../content/_output/traits.json';

import {
  Allegiance,
  BaseClass,
  ClassConfig,
  Holiday,
  IChallenge,
  IClassTraitTree,
  IDynamicEventData,
  IFate,
  IGameSettings,
  IItemDefinition,
  IMaterialSlotLayout,
  INPCDefinition,
  INPCScript,
  IPremium,
  IQuest,
  IRecipe,
  IRNGDungeonConfig,
  ISpawnerData,
  ISpellData,
  IStatusEffectData,
  ITrait,
  IWeaponTier,
  Rollable,
  Skill,
  Stat,
  WeaponClass,
} from '../../interfaces';
import { BaseService } from '../../models/BaseService';

const realJSON = (json) => json.default || json;

@Injectable()
export class ContentManager extends BaseService {
  private mapDroptables: Record<string, { drops: Rollable[] }>;
  private regionDroptables: Record<string, { drops: Rollable[] }>;
  private items: Record<string, IItemDefinition>;
  private npcs: Record<string, INPCDefinition>;
  private npcScripts: Record<string, INPCScript>;
  private recipes: Record<string, IRecipe[]>;
  private allRecipes: Record<string, IRecipe>;
  private spawners: Record<string, ISpawnerData>;
  private quests: Record<string, IQuest>;
  private traits: Record<string, ITrait>;
  private traitTrees: Record<string, IClassTraitTree>;
  private effectData: Record<string, IStatusEffectData>;
  private spells: Record<string, ISpellData>;

  private customRegionDroptables: Record<string, { drops: Rollable[] }> = {};
  private customMapDroptables: Record<string, { drops: Rollable[] }> = {};

  private customNPCs: Record<string, INPCDefinition> = {};
  private customNPCsByMap: Record<string, Record<string, INPCDefinition>> = {};

  private customSpawners: Record<string, ISpawnerData> = {};
  private customSpawnersByMap: Record<string, Record<string, ISpawnerData>> =
    {};

  private customItems: Record<string, IItemDefinition> = {};
  private customItemsByMap: Record<string, Record<string, IItemDefinition>> =
    {};

  private allegianceStats: Record<
    Allegiance,
    Array<{ stat: Stat; value: number }>
  >;
  private attributeStats: Array<{
    attribute: string;
    stats: Array<{ stat: Stat; boost: number }>;
  }>;
  private challenge: IChallenge;
  private charSelect: {
    baseStats: Record<Stat | 'gold', number>;
    allegiances: any[];
    classes: any[];
    weapons: any[];
  };
  private events: Record<string, IDynamicEventData>;
  private fate: IFate;
  private hideReductions: Record<WeaponClass, number>;
  private holidayDescs: Record<
    Holiday,
    { name: string; text: string; duration: string; month: number }
  >;
  private materialStorage: IMaterialSlotLayout;
  private npcNames: string[];
  private premium: IPremium;
  private rarespawns: Record<string, { spawns: string[] }>;
  private settings: IGameSettings;
  private skillDescs: Record<Skill, string[]>;
  private statDamageMultipliers: Record<Stat, number[]>;
  private staticText: { terrain: string[]; decor: Record<string, string> };
  private weaponTiers: Record<WeaponClass, IWeaponTier>;
  private rngDungeonConfig: IRNGDungeonConfig;
  private spriteinfo: { doorStates: any[] };

  public get allItems(): Record<string, IItemDefinition> {
    return cloneDeep(this.items);
  }

  public get allNPCs(): Record<string, INPCDefinition> {
    return cloneDeep(this.npcs);
  }

  public get allegianceStatsData(): Record<
    Allegiance,
    Array<{ stat: Stat; value: number }>
  > {
    return cloneDeep(this.allegianceStats);
  }

  public get attributeStatsData(): Array<{
    attribute: string;
    stats: Array<{ stat: Stat; boost: number }>;
  }> {
    return cloneDeep(this.attributeStats);
  }

  public get challengeData() {
    return cloneDeep(this.challenge);
  }

  public get charSelectData() {
    return cloneDeep(this.charSelect);
  }

  public get eventsData(): Record<string, IDynamicEventData> {
    return cloneDeep(this.events);
  }

  public get fateData(): IFate {
    return cloneDeep(this.fate);
  }

  public get hideReductionsData(): Record<WeaponClass, number> {
    return cloneDeep(this.hideReductions);
  }

  public get holidayDescsData(): Record<
    Holiday,
    { name: string; text: string; duration: string }
  > {
    return cloneDeep(this.holidayDescs);
  }

  public get materialStorageData(): IMaterialSlotLayout {
    return cloneDeep(this.materialStorage);
  }

  public get npcNamesData(): string[] {
    return cloneDeep(this.npcNames);
  }

  public get premiumData(): IPremium {
    return cloneDeep(this.premium);
  }

  public get rarespawnsData(): Record<string, { spawns: string[] }> {
    return cloneDeep(this.rarespawns);
  }

  public get settingsData(): IGameSettings {
    return cloneDeep(this.settings);
  }

  public get skillDescsData(): Record<Skill, string[]> {
    return cloneDeep(this.skillDescs);
  }

  public get staticTextData(): {
    terrain: string[];
    decor: Record<string, string>;
  } {
    return cloneDeep(this.staticText);
  }

  public get statDamageMultipliersData(): Record<Stat, number[]> {
    return cloneDeep(this.statDamageMultipliers);
  }

  public get weaponTiersData(): Record<string, IWeaponTier> {
    return cloneDeep(this.weaponTiers);
  }

  public get rngDungeonConfigData(): IRNGDungeonConfig {
    return cloneDeep(this.rngDungeonConfig);
  }

  public get spriteData(): { doorStates: any[] } {
    return cloneDeep(this.spriteinfo);
  }

  public async reload() {
    return new Promise((resolve) => {
      dl('LandOfTheRair/Content', 'content', async () => {
        childProcess.exec('cd content && npm install --unsafe-perm');
        this.init();

        resolve(null);
      });
    });
  }

  public init() {
    this.loadCore();
    this.loadMapDroptables();
    this.loadRegionDroptables();
    this.loadItems();
    this.loadNPCs();
    this.loadNPCScripts();
    this.loadRecipes();
    this.loadSpawners();
    this.loadQuests();
    this.loadTraits();
    this.loadEffects();
    this.loadSpells();
  }

  public getDropablesForRegion(region: string): { drops: Rollable[] } {
    return (
      this.customRegionDroptables[region] ||
      this.regionDroptables[region] || { drops: [] }
    );
  }

  public getDroptablesForMap(mapName: string): { drops: Rollable[] } {
    return (
      this.customMapDroptables[mapName] ||
      this.mapDroptables[mapName] || { drops: [] }
    );
  }

  public getItemDefinition(itemName: string): IItemDefinition {
    return this.customItems[itemName] || this.items[itemName];
  }

  public getNPCDefinition(npcId: string): INPCDefinition {
    return this.customNPCs[npcId] || this.npcs[npcId];
  }

  public getNPCScript(npcTag: string): INPCScript {
    return this.npcScripts[npcTag];
  }

  public getRecipesForTradeskill(tradeskill): IRecipe[] {
    return this.recipes[tradeskill] || [];
  }

  public getRecipe(name: string): IRecipe | undefined {
    return this.allRecipes[name];
  }

  public getSpawnerByTag(spawnerTag: string): ISpawnerData {
    return this.customSpawners[spawnerTag] || this.spawners[spawnerTag];
  }

  public getQuest(quest: string): IQuest {
    return this.quests[quest];
  }

  public getTrait(trait: string): ITrait {
    return this.traits[trait];
  }

  public getTraitTree(tree: BaseClass): IClassTraitTree {
    return this.traitTrees[tree];
  }

  public getEffect(name: string): IStatusEffectData {
    return this.effectData[name];
  }

  public getSpell(name: string): ISpellData {
    return this.spells[name];
  }

  public getEvent(name: string): IDynamicEventData {
    return this.events[name];
  }

  public getClassConfigSetting<T extends keyof ClassConfig>(
    baseClass: BaseClass,
    key: T,
  ): ClassConfig[T] {
    const ret = this.settings.classConfig[baseClass][key];
    if (isUndefined(ret)) {
      throw new Error(`Class config key ${baseClass}->${key} was undefined.`);
    }

    return ret as ClassConfig[T];
  }

  public getGameSetting(name: keyof IGameSettings, subKey?: string): any {
    if (!subKey) return this.settings[name];

    return get(this.settings[name], subKey);
  }

  public updateCustomRegionDroptables(region: string, drops: Rollable[]) {
    this.customRegionDroptables[region] = { drops };
  }

  public updateCustomMapDroptable(mapName: string, drops: Rollable[]) {
    this.customMapDroptables[mapName] = { drops };
  }

  public addCustomNPC(mapName: string, def: INPCDefinition): void {
    this.customNPCsByMap[mapName] = this.customNPCsByMap[mapName] || {};
    this.customNPCsByMap[mapName][def.npcId] = def;

    this.customNPCs[def.npcId] = def;
  }

  public clearCustomNPCs(mapName: string): void {
    Object.keys(this.customNPCsByMap?.[mapName] ?? {}).forEach((npcId) => {
      delete this.customNPCs[npcId];
      delete this.customNPCsByMap[mapName][npcId];
    });
  }

  public addCustomItem(mapName: string, def: IItemDefinition): void {
    this.customItemsByMap[mapName] = this.customItemsByMap[mapName] || {};
    this.customItemsByMap[mapName][def.name] = def;

    this.customItems[def.name] = def;
  }

  public clearCustomItems(mapName: string): void {
    Object.keys(this.customItemsByMap?.[mapName] ?? {}).forEach((itemName) => {
      delete this.customItems[itemName];
      delete this.customItemsByMap[mapName][itemName];
    });
  }

  public addCustomSpawner(
    mapName: string,
    spawnerName: string,
    def: ISpawnerData,
  ): void {
    this.customSpawnersByMap[mapName] = this.customSpawnersByMap[mapName] || {};
    this.customSpawnersByMap[mapName][spawnerName] = def;

    this.customSpawners[spawnerName] = def;
  }

  public clearCustomSpawners(mapName: string): void {
    Object.keys(this.customSpawnersByMap?.[mapName] ?? {}).forEach(
      (spawnerName) => {
        delete this.customSpawners[spawnerName];
        delete this.customSpawnersByMap[mapName][spawnerName];
      },
    );
  }

  public getItemsMatchingName(mapName: string): IItemDefinition[] {
    return Object.values(this.items)
      .filter((item) => item.name.includes(mapName))
      .map((x) => cloneDeep(x));
  }

  private chooseConfigFileOrPreset(file: string, preset: any) {
    if (fs.existsSync(`config/${file}.json`)) {
      this.game.logger.log(
        'ContentManager',
        `Using custom config file for ${file}...`,
      );
      return fs.readJsonSync(`config/${file}.json`);
    }

    return preset;
  }

  private loadCore() {
    this.allegianceStats = deepfreeze(
      this.chooseConfigFileOrPreset(
        'allegiancestats',
        realJSON(allegiancestats),
      ),
    );
    this.attributeStats = deepfreeze(
      this.chooseConfigFileOrPreset('attributestats', realJSON(attributestats)),
    );
    this.challenge = deepfreeze(
      this.chooseConfigFileOrPreset('challenge', realJSON(challenge)),
    );
    this.charSelect = deepfreeze(
      this.chooseConfigFileOrPreset('charselect', realJSON(charselect)),
    );
    this.events = deepfreeze(
      this.chooseConfigFileOrPreset('events', realJSON(events)),
    );
    this.fate = deepfreeze(
      this.chooseConfigFileOrPreset('fate', realJSON(fate)),
    );
    this.hideReductions = deepfreeze(
      this.chooseConfigFileOrPreset('hidereductions', realJSON(hidereductions)),
    );
    this.holidayDescs = deepfreeze(
      this.chooseConfigFileOrPreset('holidaydescs', realJSON(holidaydescs)),
    );
    this.materialStorage = deepfreeze(
      this.chooseConfigFileOrPreset(
        'materialstorage',
        realJSON(materialstorage),
      ),
    );
    this.npcNames = deepfreeze(
      this.chooseConfigFileOrPreset('npcnames', realJSON(npcnames)),
    );
    this.premium = deepfreeze(
      this.chooseConfigFileOrPreset('premium', realJSON(premium)),
    );
    this.rarespawns = deepfreeze(
      this.chooseConfigFileOrPreset('rarespawns', realJSON(rarespawns)),
    );
    this.settings = deepfreeze(
      this.chooseConfigFileOrPreset('settings', realJSON(settings)),
    );
    this.skillDescs = deepfreeze(
      this.chooseConfigFileOrPreset('skilldescs', realJSON(skilldescs)),
    );
    this.statDamageMultipliers = deepfreeze(
      this.chooseConfigFileOrPreset(
        'statdamagemultipliers',
        realJSON(statdamagemultipliers),
      ),
    );
    this.staticText = deepfreeze(
      this.chooseConfigFileOrPreset('statictext', realJSON(statictext)),
    );
    this.weaponTiers = deepfreeze(
      this.chooseConfigFileOrPreset('weapontiers', realJSON(weapontiers)),
    );
    this.rngDungeonConfig = deepfreeze(
      this.chooseConfigFileOrPreset(
        'rngdungeonconfig',
        realJSON(rngdungeonconfig),
      ),
    );
    this.spriteinfo = deepfreeze(
      this.chooseConfigFileOrPreset('sprite-data', realJSON(spriteinfo)),
    );
  }

  private loadSpells() {
    this.spells = this.chooseConfigFileOrPreset(
      'spells',
      realJSON(spells),
    ) as any as Record<string, ISpellData>;

    deepfreeze(this.spells);
  }

  private loadEffects() {
    this.effectData = this.chooseConfigFileOrPreset(
      'effect-data',
      realJSON(effectData),
    ) as any as Record<string, IStatusEffectData>;

    deepfreeze(this.effectData);
  }

  private loadTraits() {
    this.traits = this.chooseConfigFileOrPreset(
      'traits',
      realJSON(traits),
    ) as any as Record<string, ITrait>;

    deepfreeze(this.traits);

    this.traitTrees = realJSON(traitTrees) as any as Record<
      string,
      IClassTraitTree
    >;

    deepfreeze(this.traitTrees);
  }

  private loadQuests() {
    this.quests = this.chooseConfigFileOrPreset(
      'quests',
      realJSON(quests),
    ) as any as Record<string, IQuest>;

    this.game.modkitManager.modQuests.forEach((quest) => {
      if (this.quests[quest.name]) {
        this.game.logger.warn(
          'ContentManager:LoadQuestsMod',
          `Duplicate quest name (mod) ${quest.name}, skipping...`,
        );
        return;
      }

      this.quests[quest.name] = quest;
    });

    deepfreeze(this.quests);
  }

  private loadMapDroptables() {
    this.mapDroptables = this.chooseConfigFileOrPreset(
      'droptable-maps',
      realJSON(droptablesMaps),
    ).reduce((prev, cur) => {
      if (prev[cur.mapName]) {
        this.game.logger.warn(
          'ContentManager:LoadMapDroptables',
          `Duplicate map droptable for ${cur.mapName}, skipping...`,
        );
        return;
      }

      prev[cur.mapName] = cur;
      return prev;
    }, {});

    this.game.modkitManager.modMapDrops.forEach((dt) => {
      if (this.mapDroptables[dt.mapName]) {
        this.game.logger.warn(
          'ContentManager:LoadMapDroptablesMod',
          `Duplicate map droptable (mod) ${dt.mapName}, skipping...`,
        );
        return;
      }

      this.mapDroptables[dt.mapName] = dt;
    });

    deepfreeze(this.mapDroptables);
  }

  private loadRegionDroptables() {
    this.regionDroptables = this.chooseConfigFileOrPreset(
      'droptable-regions',
      realJSON(droptablesRegions),
    ).reduce((prev, cur) => {
      if (prev[cur.regionName]) {
        this.game.logger.warn(
          'ContentManager:LoadRegionDroptables',
          `Duplicate region droptable for ${cur.regionName}, skipping...`,
        );
        return;
      }

      prev[cur.regionName] = cur;
      return prev;
    }, {});

    this.game.modkitManager.modRegionDrops.forEach((dt) => {
      if (this.regionDroptables[dt.regionName]) {
        this.game.logger.warn(
          'ContentManager:LoadRegionDroptablesMod',
          `Duplicate region droptable (mod) ${dt.regionName}, skipping...`,
        );
        return;
      }

      this.mapDroptables[dt.regionName] = dt;
    });

    deepfreeze(this.regionDroptables);
  }

  private loadItems() {
    this.items = this.chooseConfigFileOrPreset('items', realJSON(items)).reduce(
      (prev, cur) => {
        if (prev[cur.name]) {
          this.game.logger.warn(
            'ContentManager:LoadItems',
            `Duplicate item ${cur.name}, skipping...`,
          );
          return;
        }

        prev[cur.name] = cur;
        return prev;
      },
      {},
    );

    this.game.modkitManager.modItems.forEach((item) => {
      if (this.items[item.name]) {
        this.game.logger.warn(
          'ContentManager:LoadItemsMod',
          `Duplicate item (mod) ${item.name}, skipping...`,
        );
        return;
      }

      this.items[item.name] = item;
    });

    deepfreeze(this.items);
  }

  private loadNPCs() {
    this.npcs = this.chooseConfigFileOrPreset('npcs', realJSON(npcs)).reduce(
      (prev, cur) => {
        if (prev[cur.npcId]) {
          this.game.logger.warn(
            'ContentManager:LoadNPCs',
            `Duplicate NPC ${cur.npcId}, skipping...`,
          );
          return;
        }

        prev[cur.npcId] = cur;
        return prev;
      },
      {},
    );

    this.game.modkitManager.modNPCs.forEach((npc) => {
      if (this.npcs[npc.npcId]) {
        this.game.logger.warn(
          'ContentManager:LoadNPCsMod',
          `Duplicate NPC (mod) ${npc.npcId}, skipping...`,
        );
        return;
      }

      this.npcs[npc.npcId] = npc;
    });

    deepfreeze(this.npcs);
  }

  private loadNPCScripts() {
    this.npcScripts = this.chooseConfigFileOrPreset(
      'npc-scripts',
      realJSON(npcScripts),
    ).reduce((prev, cur) => {
      if (prev[cur.tag]) {
        this.game.logger.warn(
          'ContentManager:LoadNPCScripts',
          `Duplicate NPC Script ${cur.tag}, skipping...`,
        );
        return;
      }

      prev[cur.tag] = cur;
      return prev;
    }, {});

    this.game.modkitManager.modNPCScripts.forEach((script) => {
      if (this.npcScripts[script.tag]) {
        this.game.logger.warn(
          'ContentManager:LoadNPCScriptsMod',
          `Duplicate NPC Script (mod) ${script.tag}, skipping...`,
        );
        return;
      }

      this.npcScripts[script.tag] = script;
    });

    deepfreeze(this.npcScripts);
  }

  private loadRecipes() {
    this.recipes = {};
    this.allRecipes = {};

    this.chooseConfigFileOrPreset('recipes', realJSON(recipes)).forEach(
      (recipe) => {
        if (this.allRecipes[recipe.name]) {
          this.game.logger.warn(
            'ContentManager:LoadRecipes',
            `Duplicate recipe ${recipe.name}, skipping...`,
          );
          return;
        }

        this.recipes[recipe.recipeType] = this.recipes[recipe.recipeType] || [];
        this.recipes[recipe.recipeType].push(recipe as IRecipe);

        this.allRecipes[recipe.name] = recipe as IRecipe;
      },
    );

    this.game.modkitManager.modRecipes.forEach((recipe) => {
      if (this.allRecipes[recipe.name]) {
        this.game.logger.warn(
          'ContentManager:LoadRecipesMod',
          `Duplicate recipe (mod) ${recipe.name}, skipping...`,
        );
        return;
      }

      this.recipes[recipe.recipeType] = this.recipes[recipe.recipeType] || [];
      this.recipes[recipe.recipeType].push(recipe as IRecipe);

      this.allRecipes[recipe.name] = recipe as IRecipe;
    });

    deepfreeze(this.recipes);
    deepfreeze(this.allRecipes);
  }

  private loadSpawners() {
    this.spawners = this.chooseConfigFileOrPreset(
      'spawners',
      realJSON(spawners),
    ).reduce((prev, cur) => {
      if (prev[cur.tag]) {
        this.game.logger.warn(
          'ContentManager:LoadSpawners',
          `Duplicate spawner ${cur.tag}, skipping...`,
        );
        return;
      }

      prev[cur.tag] = cur;
      return prev;
    }, {});

    this.game.modkitManager.modSpawners.forEach((spawner) => {
      if (this.spawners[spawner.tag]) {
        this.game.logger.warn(
          'ContentManager:LoadSpawnersMod',
          `Duplicate spawner (mod) ${spawner.tag}, skipping...`,
        );
        return;
      }

      this.spawners[spawner.tag] = spawner;
    });

    deepfreeze(this.spawners);
  }
}
