import { Singleton } from 'typescript-ioc';

import fs from 'fs-extra';

@Singleton
export class ContentManager {

  private charSelect: any;
  public get charSelectData() {
    return JSON.parse(JSON.stringify(this.charSelect));
  }

  public mapDroptables: any;
  public regionDroptables: any;
  public items: any;
  public npcs: any;
  public npcScripts: any;
  public recipes: any;
  public spawners: any;

  public init() {
    this.loadCharSelect();
    this.loadMapDroptables();
    this.loadRegionDroptables();
    this.loadItems();
    this.loadNPCs();
    this.loadNPCScripts();
    this.loadRecipes();
    this.loadSpawners();
  }

  private loadCharSelect() {
    this.charSelect = fs.readJsonSync('content/_output/charselect.json');
  }

  private loadMapDroptables() {
    const droptables = fs.readJsonSync('content/_output/droptable-maps.json');
    this.mapDroptables = droptables.reduce((prev, cur) => {
      prev[cur.mapName] = cur;
      return prev;
    }, {});
  }

  private loadRegionDroptables() {
    const droptables = fs.readJsonSync('content/_output/droptable-regions.json');
    this.regionDroptables = droptables.reduce((prev, cur) => {
      prev[cur.regionName] = cur;
      return prev;
    }, {});
  }

  private loadItems() {
    const items = fs.readJsonSync('content/_output/items.json');
    this.items = items.reduce((prev, cur) => {
      prev[cur.name] = cur;
      return prev;
    }, {});
  }

  private loadNPCs() {
    const npcs = fs.readJsonSync('content/_output/npcs.json');
    this.npcs = npcs.reduce((prev, cur) => {
      prev[cur.npcId] = cur;
      return prev;
    }, {});
  }

  private loadNPCScripts() {
    const npcScripts = fs.readJsonSync('content/_output/npc-scripts.json');
    this.npcScripts = npcScripts.reduce((prev, cur) => {
      prev[cur.tag] = cur;
      return prev;
    }, {});
  }

  private loadRecipes() {
    const recipes = fs.readJsonSync('content/_output/recipes.json');
    this.recipes = {};

    recipes.forEach(recipe => {
      this.recipes[recipe.recipeType] = this.recipes[recipe.recipeType] || [];
      this.recipes[recipe.recipeType].push(recipe);
    });
  }

  private loadSpawners() {
    const spawners = fs.readJsonSync('content/_output/spawners.json');
    this.spawners = spawners.reduce((prev, cur) => {
      prev[cur.tag] = cur;
      return prev;
    }, {});
  }

}
