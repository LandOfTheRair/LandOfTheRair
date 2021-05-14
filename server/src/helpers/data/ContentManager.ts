import fs from 'fs-extra';
import deepfreeze from 'deep-freeze';
import { Injectable } from 'injection-js';
import { cloneDeep, get } from 'lodash';

import { Allegiance, BaseClass, Holiday, IClassTraitTree,
  IDynamicEventData,
  IFate,
  IGameSettings,
  IItemDefinition, IMaterialSlotLayout, INPCDefinition, INPCScript, IPremium, IQuest, IRecipe, ISpawnerData, ISpellData,
  IStatusEffectData, ITrait, IWeaponTier, Rollable, Skill, Stat, WeaponClass } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class ContentManager extends BaseService {

  private mapDroptables: Record<string, { drops: Rollable[] }>;
  private regionDroptables: Record<string, { drops: Rollable[] }>;
  private items: Record<string, IItemDefinition>;
  private npcs: Record<string, INPCDefinition>;
  private npcScripts: Record<string, INPCScript>;
  private recipes: Record<string, IRecipe[]>;
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
    this.allegianceStats = deepfreeze(fs.readJsonSync('content/_output/allegiancestats.json'));
    this.attributeStats = deepfreeze(fs.readJsonSync('content/_output/attributestats.json'));
    this.charSelect = deepfreeze(fs.readJsonSync('content/_output/charselect.json'));
    this.events = deepfreeze(fs.readJsonSync('content/_output/events.json'));
    this.fate = deepfreeze(fs.readJsonSync('content/_output/fate.json'));
    this.hideReductions = deepfreeze(fs.readJsonSync('content/_output/hidereductions.json'));
    this.holidayDescs = deepfreeze(fs.readJsonSync('content/_output/holidaydescs.json'));
    this.materialStorage = deepfreeze(fs.readJsonSync('content/_output/materialstorage.json'));
    this.npcNames = deepfreeze(fs.readJsonSync('content/_output/npcnames.json'));
    this.premium = deepfreeze(fs.readJsonSync('content/_output/premium.json'));
    this.rarespawns = deepfreeze(fs.readJsonSync('content/_output/rarespawns.json'));
    this.settings = deepfreeze(fs.readJsonSync('content/_output/settings.json'));
    this.skillDescs = deepfreeze(fs.readJsonSync('content/_output/skilldescs.json'));
    this.statDamageMultipliers = deepfreeze(fs.readJsonSync('content/_output/statdamagemultipliers.json'));
    this.staticText = deepfreeze(fs.readJsonSync('content/_output/statictext.json'));
    this.weaponTiers = deepfreeze(fs.readJsonSync('content/_output/weapontiers.json'));
  }

  private loadSpells() {
    const spells = fs.readJsonSync('content/_output/spells.json');
    this.spells = spells;

    deepfreeze(this.spells);
  }

  private loadEffects() {
    const effectData = fs.readJsonSync('content/_output/effect-data.json');
    this.effectData = effectData;

    deepfreeze(this.effectData);
  }

  private loadTraits() {
    const traits = fs.readJsonSync('content/_output/traits.json');
    this.traits = traits;

    deepfreeze(this.traits);

    const traitTrees = fs.readJsonSync('content/_output/trait-trees.json');
    this.traitTrees = traitTrees;

    deepfreeze(this.traitTrees);
  }

  private loadQuests() {
    const quests = fs.readJsonSync('content/_output/quests.json');
    this.quests = quests;

    deepfreeze(this.quests);
  }

  private loadMapDroptables() {
    const droptables = fs.readJsonSync('content/_output/droptable-maps.json');
    this.mapDroptables = droptables.reduce((prev, cur) => {
      prev[cur.mapName] = cur;
      return prev;
    }, {});

    deepfreeze(this.mapDroptables);
  }

  private loadRegionDroptables() {
    const droptables = fs.readJsonSync('content/_output/droptable-regions.json');
    this.regionDroptables = droptables.reduce((prev, cur) => {
      prev[cur.regionName] = cur;
      return prev;
    }, {});

    deepfreeze(this.regionDroptables);
  }

  private loadItems() {
    const items = fs.readJsonSync('content/_output/items.json');
    this.items = items.reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {});

    deepfreeze(this.items);
  }

  private loadNPCs() {
    const npcs = fs.readJsonSync('content/_output/npcs.json');
    this.npcs = npcs.reduce((prev, cur) => {
      prev[cur.npcId] = cur;
      return prev;
    }, {});

    deepfreeze(this.npcs);
  }

  private loadNPCScripts() {
    const npcScripts = fs.readJsonSync('content/_output/npc-scripts.json');
    this.npcScripts = npcScripts.reduce((prev, cur) => {
      prev[cur.tag] = cur;
      return prev;
    }, {});

    deepfreeze(this.npcScripts);
  }

  private loadRecipes() {
    const recipes = fs.readJsonSync('content/_output/recipes.json');
    this.recipes = {};

    recipes.forEach(recipe => {
      this.recipes[recipe.recipeType] = this.recipes[recipe.recipeType] || [];
      this.recipes[recipe.recipeType].push(recipe);
    });

    deepfreeze(this.recipes);
  }

  private loadSpawners() {
    const spawners = fs.readJsonSync('content/_output/spawners.json');
    this.spawners = spawners.reduce((prev, cur) => {
      prev[cur.tag] = cur;
      return prev;
    }, {});

    deepfreeze(this.spawners);
  }

}
