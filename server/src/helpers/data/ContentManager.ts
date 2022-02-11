import childProcess from 'child_process';
import deepfreeze from 'deep-freeze';
import { Injectable } from 'injection-js';
import { cloneDeep, get } from 'lodash';

import dl from 'download-github-repo';

import * as allegiancestats from '../../../content/_output/allegiancestats.json';
import * as attributestats from '../../../content/_output/attributestats.json';
import * as charselect from '../../../content/_output/charselect.json';
import * as events from '../../../content/_output/events.json';
import * as fate from '../../../content/_output/fate.json';
import * as hidereductions from '../../../content/_output/hidereductions.json';
import * as holidaydescs from '../../../content/_output/holidaydescs.json';
import * as materialstorage from '../../../content/_output/materialstorage.json';
import * as npcnames from '../../../content/_output/npcnames.json';
import * as premium from '../../../content/_output/premium.json';
import * as rarespawns from '../../../content/_output/rarespawns.json';
import * as settings from '../../../content/_output/settings.json';
import * as skilldescs from '../../../content/_output/skilldescs.json';
import * as statdamagemultipliers from '../../../content/_output/statdamagemultipliers.json';
import * as statictext from '../../../content/_output/statictext.json';
import * as weapontiers from '../../../content/_output/weapontiers.json';

import * as spells from '../../../content/_output/spells.json';
import * as effectData from '../../../content/_output/effect-data.json';
import * as traits from '../../../content/_output/traits.json';
import * as traitTrees from '../../../content/_output/trait-trees.json';
import * as quests from '../../../content/_output/quests.json';
import * as droptablesMaps from '../../../content/_output/droptable-maps.json';
import * as droptablesRegions from '../../../content/_output/droptable-regions.json';
import * as items from '../../../content/_output/items.json';
import * as npcs from '../../../content/_output/npcs.json';
import * as npcScripts from '../../../content/_output/npc-scripts.json';
import * as recipes from '../../../content/_output/recipes.json';
import * as spawners from '../../../content/_output/spawners.json';

import { Allegiance, BaseClass, Holiday, IClassTraitTree,
  IDynamicEventData,
  IFate,
  IGameSettings,
  IItemDefinition, IMaterialSlotLayout, INPCDefinition, INPCScript, IPremium, IQuest, IRecipe, ISpawnerData, ISpellData,
  IStatusEffectData, ITrait, IWeaponTier, Rollable, Skill, Stat, WeaponClass } from '../../interfaces';
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

  private allegianceStats: Record<Allegiance, Array<{ stat: Stat; value: number }>>;
  private attributeStats: Array<{ attribute: string; stats: Array<{ stat: Stat; boost: number }> }>;
  private charSelect: { baseStats: Record<Stat | 'gold', number>; allegiances: any[]; classes: any[]; weapons: any[] };
  private events: Record<string, IDynamicEventData>;
  private fate: IFate;
  private hideReductions: Record<WeaponClass, number>;
  private holidayDescs: Record<Holiday, { name: string; text: string; duration: string; month: number }>;
  private materialStorage: IMaterialSlotLayout;
  private npcNames: string[];
  private premium: IPremium;
  private rarespawns: Record<string, { spawns: string[] }>;
  private settings: IGameSettings;
  private skillDescs: Record<Skill, string[]>;
  private statDamageMultipliers: Record<Stat, number[]>;
  private staticText: { terrain: string[]; decor: Record<string, string> };
  private weaponTiers: Record<WeaponClass, IWeaponTier>;

  public get allItems(): Record<string, IItemDefinition> {
    return cloneDeep(this.items);
  }

  public get allNPCs(): Record<string, INPCDefinition> {
    return cloneDeep(this.npcs);
  }

  public get allegianceStatsData(): Record<Allegiance, Array<{ stat: Stat; value: number }>> {
    return cloneDeep(this.allegianceStats);
  }

  public get attributeStatsData(): Array<{ attribute: string; stats: Array<{ stat: Stat; boost: number }> }> {
    return cloneDeep(this.attributeStats);
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

  public get holidayDescsData(): Record<Holiday, { name: string; text: string; duration: string }> {
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

  public get staticTextData(): { terrain: string[]; decor: Record<string, string> } {
    return cloneDeep(this.staticText);
  }

  public get statDamageMultipliersData(): Record<Stat, number[]> {
    return cloneDeep(this.statDamageMultipliers);
  }

  public get weaponTiersData(): Record<string, IWeaponTier> {
    return cloneDeep(this.weaponTiers);
  }

  public async reload() {
    return new Promise(resolve => {
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
    return this.regionDroptables[region];
  }

  public getDroptablesForMap(mapName: string): { drops: Rollable[] } {
    return this.mapDroptables[mapName];
  }

  public getItemDefinition(itemName: string): IItemDefinition {
    return this.items[itemName];
  }

  public getNPCDefinition(npcId: string): INPCDefinition {
    return this.npcs[npcId];
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
    return this.spawners[spawnerTag];
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

  public getGameSetting(name: keyof IGameSettings, subKey?: string): any {
    if (!subKey) return this.settings[name];

    return get(this.settings[name], subKey);
  }

  private loadCore() {
    this.allegianceStats = deepfreeze(realJSON(allegiancestats));
    this.attributeStats = deepfreeze(realJSON(attributestats));
    this.charSelect = deepfreeze(realJSON(charselect));
    this.events = deepfreeze(realJSON(events));
    this.fate = deepfreeze(realJSON(fate));
    this.hideReductions = deepfreeze(realJSON(hidereductions));
    this.holidayDescs = deepfreeze(realJSON(holidaydescs));
    this.materialStorage = deepfreeze(realJSON(materialstorage));
    this.npcNames = deepfreeze(realJSON(npcnames));
    this.premium = deepfreeze(realJSON(premium));
    this.rarespawns = deepfreeze(realJSON(rarespawns));
    this.settings = deepfreeze(realJSON(settings));
    this.skillDescs = deepfreeze(realJSON(skilldescs));
    this.statDamageMultipliers = deepfreeze(realJSON(statdamagemultipliers));
    this.staticText = deepfreeze(realJSON(statictext));
    this.weaponTiers = deepfreeze(realJSON(weapontiers));
  }

  private loadSpells() {
    this.spells = realJSON(spells) as any as Record<string, ISpellData>;

    deepfreeze(this.spells);
  }

  private loadEffects() {
    this.effectData = realJSON(effectData) as any as Record<string, IStatusEffectData>;

    deepfreeze(this.effectData);
  }

  private loadTraits() {
    this.traits = realJSON(traits) as any as Record<string, ITrait>;

    deepfreeze(this.traits);

    this.traitTrees = realJSON(traitTrees) as any as Record<string, IClassTraitTree>;

    deepfreeze(this.traitTrees);
  }

  private loadQuests() {
    this.quests = realJSON(quests) as any as Record<string, IQuest>;

    deepfreeze(this.quests);
  }

  private loadMapDroptables() {
    this.mapDroptables = realJSON(droptablesMaps).reduce((prev, cur) => {
      prev[cur.mapName] = cur;
      return prev;
    }, {});

    deepfreeze(this.mapDroptables);
  }

  private loadRegionDroptables() {
    this.regionDroptables = realJSON(droptablesRegions).reduce((prev, cur) => {
      prev[cur.regionName] = cur;
      return prev;
    }, {});

    deepfreeze(this.regionDroptables);
  }

  private loadItems() {
    this.items = realJSON(items).reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {});

    deepfreeze(this.items);
  }

  private loadNPCs() {
    this.npcs = realJSON(npcs).reduce((prev, cur) => {
      prev[cur.npcId] = cur;
      return prev;
    }, {});

    deepfreeze(this.npcs);
  }

  private loadNPCScripts() {
    this.npcScripts = realJSON(npcScripts).reduce((prev, cur) => {
      prev[cur.tag] = cur;
      return prev;
    }, {});

    deepfreeze(this.npcScripts);
  }

  private loadRecipes() {
    this.recipes = {};
    this.allRecipes = {};

    realJSON(recipes).forEach(recipe => {
      this.recipes[recipe.recipeType] = this.recipes[recipe.recipeType] || [];
      this.recipes[recipe.recipeType].push(recipe as IRecipe);

      this.allRecipes[recipe.name] = recipe as IRecipe;
    });

    deepfreeze(this.recipes);
    deepfreeze(this.allRecipes);
  }

  private loadSpawners() {
    this.spawners = realJSON(spawners).reduce((prev, cur) => {
      prev[cur.tag] = cur;
      return prev;
    }, {});

    deepfreeze(this.spawners);
  }

}
