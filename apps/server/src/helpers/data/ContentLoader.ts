import childProcess from 'child_process';
import fs from 'fs-extra';
import { Injectable } from 'injection-js';

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
import * as weapontiersnpc from '../../../content/_output/weapontiersnpc.json';

import * as achievements from '../../../content/_output/achievements.json';
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

import { setContentKey, settingsLoadForGame } from '@lotr/content';
import type {
  IAchievement,
  IClassTraitTree,
  INPCDefinition,
  INPCScript,
  IQuest,
  IRecipe,
  ISpellData,
  IStatusEffectData,
  ITrait,
} from '@lotr/interfaces';
import { consoleLog, consoleWarn } from '@lotr/logger';
import { BaseService } from '../../models/BaseService';

const realJSON = (json) => json.default || json;

@Injectable()
export class ContentLoader extends BaseService {
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
    this.loadAchievements();
    settingsLoadForGame();
  }

  private chooseConfigFileOrPreset(file: string, preset: any) {
    if (fs.existsSync(`config/${file}.json`)) {
      consoleLog('ContentManager', `Using custom config file for ${file}...`);
      return fs.readJsonSync(`config/${file}.json`);
    }

    return preset;
  }

  private loadCore() {
    setContentKey(
      'allegianceStats',
      this.chooseConfigFileOrPreset(
        'allegiancestats',
        realJSON(allegiancestats),
      ),
    );
    setContentKey(
      'attributeStats',
      this.chooseConfigFileOrPreset('attributestats', realJSON(attributestats)),
    );
    setContentKey(
      'challenge',
      this.chooseConfigFileOrPreset('challenge', realJSON(challenge)),
    );
    setContentKey(
      'charSelect',
      this.chooseConfigFileOrPreset('charselect', realJSON(charselect)),
    );
    setContentKey(
      'events',
      this.chooseConfigFileOrPreset('events', realJSON(events)),
    );
    setContentKey(
      'fate',
      this.chooseConfigFileOrPreset('fate', realJSON(fate)),
    );
    setContentKey(
      'hideReductions',
      this.chooseConfigFileOrPreset('hidereductions', realJSON(hidereductions)),
    );
    setContentKey(
      'holidayDescs',
      this.chooseConfigFileOrPreset('holidaydescs', realJSON(holidaydescs)),
    );
    setContentKey(
      'materialStorage',
      this.chooseConfigFileOrPreset(
        'materialstorage',
        realJSON(materialstorage),
      ),
    );
    setContentKey(
      'npcNames',
      this.chooseConfigFileOrPreset('npcnames', realJSON(npcnames)),
    );
    setContentKey(
      'premium',
      this.chooseConfigFileOrPreset('premium', realJSON(premium)),
    );
    setContentKey(
      'rarespawns',
      this.chooseConfigFileOrPreset('rarespawns', realJSON(rarespawns)),
    );
    setContentKey(
      'settings',
      this.chooseConfigFileOrPreset('settings', realJSON(settings)),
    );
    setContentKey(
      'skillDescs',
      this.chooseConfigFileOrPreset('skilldescs', realJSON(skilldescs)),
    );
    setContentKey(
      'statDamageMultipliers',
      this.chooseConfigFileOrPreset(
        'statdamagemultipliers',
        realJSON(statdamagemultipliers),
      ),
    );
    setContentKey(
      'staticText',
      this.chooseConfigFileOrPreset('statictext', realJSON(statictext)),
    );
    setContentKey(
      'weaponTiers',
      this.chooseConfigFileOrPreset('weapontiers', realJSON(weapontiers)),
    );
    setContentKey(
      'weaponTiersNPC',
      this.chooseConfigFileOrPreset('weapontiersnpc', realJSON(weapontiersnpc)),
    );
    setContentKey(
      'rngDungeonConfig',
      this.chooseConfigFileOrPreset(
        'rngdungeonconfig',
        realJSON(rngdungeonconfig),
      ),
    );
    setContentKey(
      'spriteinfo',
      this.chooseConfigFileOrPreset('sprite-data', realJSON(spriteinfo)),
    );
  }

  private loadAchievements() {
    const achievementData = this.chooseConfigFileOrPreset(
      'achievements',
      realJSON(achievements),
    ) as Record<string, IAchievement>;

    setContentKey('achievements', achievementData);
  }

  private loadSpells() {
    const spellData = this.chooseConfigFileOrPreset(
      'spells',
      realJSON(spells),
    ) as Record<string, ISpellData>;

    setContentKey('spells', spellData);
  }

  private loadEffects() {
    const effects = this.chooseConfigFileOrPreset(
      'effect-data',
      realJSON(effectData),
    ) as Record<string, IStatusEffectData>;

    setContentKey('effectData', effects);
  }

  private loadTraits() {
    const traitData = {};

    const json = this.chooseConfigFileOrPreset(
      'traits',
      realJSON(traits),
    ) as Record<string, ITrait>;

    Object.keys(json).forEach((traitId) => {
      if (traitData[traitId]) {
        consoleWarn(
          'ContentManager:LoadTraits',
          `Duplicate trait ${traitId}, skipping...`,
        );
        return;
      }

      traitData[traitId] = json[traitId];
    });

    setContentKey('traits', traitData);

    const traitTreeData = realJSON(traitTrees) as Record<
      string,
      IClassTraitTree
    >;

    setContentKey('traitTrees', traitTreeData);
  }

  private loadQuests() {
    const questData = {};

    const json = this.chooseConfigFileOrPreset(
      'quests',
      realJSON(quests),
    ) as Record<string, IQuest>;

    Object.values(json).forEach((cur) => {
      if (questData[cur.name]) {
        consoleWarn(
          'ContentManager:LoadQuests',
          `Duplicate quest ${cur.name}, skipping...`,
        );
        return;
      }

      questData[cur.name] = cur;
    });

    this.game.modkitManager.modQuests.forEach((quest) => {
      if (questData[quest.name]) {
        consoleWarn(
          'ContentManager:LoadQuestsMod',
          `Duplicate quest name (mod) ${quest.name}, skipping...`,
        );
        return;
      }

      questData[quest.name] = quest;
    });

    setContentKey('quests', questData);
  }

  private loadMapDroptables() {
    const mapDroptables = {};

    this.chooseConfigFileOrPreset(
      'droptable-maps',
      realJSON(droptablesMaps),
    ).forEach((dt) => {
      if (mapDroptables[dt.mapName]) {
        consoleWarn(
          'ContentManager:LoadMapDroptables',
          `Duplicate map droptable ${dt.mapName}, skipping...`,
        );
        return;
      }

      mapDroptables[dt.mapName] = dt;
    });

    this.game.modkitManager.modMapDrops.forEach((dt) => {
      if (mapDroptables[dt.mapName]) {
        consoleWarn(
          'ContentManager:LoadMapDroptablesMod',
          `Duplicate map droptable (mod) ${dt.mapName}, skipping...`,
        );
        return;
      }

      mapDroptables[dt.mapName] = dt;
    });

    setContentKey('mapDroptables', mapDroptables);
  }

  private loadRegionDroptables() {
    const regionDroptables = {};

    this.chooseConfigFileOrPreset(
      'droptable-regions',
      realJSON(droptablesRegions),
    ).forEach((dt) => {
      if (regionDroptables[dt.regionName]) {
        consoleWarn(
          'ContentManager:LoadRegionDroptables',
          `Duplicate region droptable for ${dt.regionName}, skipping...`,
        );
        return;
      }

      regionDroptables[dt.regionName] = dt;
    });

    this.game.modkitManager.modRegionDrops.forEach((dt) => {
      if (regionDroptables[dt.regionName]) {
        consoleWarn(
          'ContentManager:LoadRegionDroptablesMod',
          `Duplicate region droptable (mod) ${dt.regionName}, skipping...`,
        );
        return;
      }

      regionDroptables[dt.regionName] = dt;
    });

    setContentKey('regionDroptables', regionDroptables);
  }

  private loadItems() {
    const contentItems = {};

    this.chooseConfigFileOrPreset('items', realJSON(items)).forEach((cur) => {
      if (contentItems[cur.name]) {
        consoleWarn(
          'ContentManager:LoadItems',
          `Duplicate item ${cur.name}, skipping...`,
        );
        return;
      }

      contentItems[cur.name] = cur;
    });

    this.game.modkitManager.modItems.forEach((item) => {
      if (contentItems[item.name]) {
        consoleWarn(
          'ContentManager:LoadItemsMod',
          `Duplicate item (mod) ${item.name}, skipping...`,
        );
        return;
      }

      contentItems[item.name] = item;
    });

    setContentKey('items', contentItems);
  }

  private loadNPCs() {
    const npcData: Record<string, INPCDefinition> = {};

    this.chooseConfigFileOrPreset('npcs', realJSON(npcs)).forEach((cur) => {
      if (npcData[cur.npcId]) {
        consoleWarn(
          'ContentManager:LoadNPCs',
          `Duplicate NPC ${cur.npcId}, skipping...`,
        );
        return;
      }

      npcData[cur.npcId] = cur;
    });

    this.game.modkitManager.modNPCs.forEach((npc) => {
      if (npcData[npc.npcId]) {
        consoleWarn(
          'ContentManager:LoadNPCsMod',
          `Duplicate NPC (mod) ${npc.npcId}, skipping...`,
        );
        return;
      }

      npcData[npc.npcId] = npc;
    });

    setContentKey('npcs', npcData);
  }

  private loadNPCScripts() {
    const npcScriptData: Record<string, INPCScript> = {};

    this.chooseConfigFileOrPreset('npc-scripts', realJSON(npcScripts)).forEach(
      (cur) => {
        if (npcScriptData[cur.tag]) {
          consoleWarn(
            'ContentManager:LoadNPCScripts',
            `Duplicate NPC Script ${cur.tag}, skipping...`,
          );
          return;
        }

        npcScriptData[cur.tag] = cur;
      },
    );

    this.game.modkitManager.modNPCScripts.forEach((script) => {
      if (npcScriptData[script.tag]) {
        consoleWarn(
          'ContentManager:LoadNPCScriptsMod',
          `Duplicate NPC Script (mod) ${script.tag}, skipping...`,
        );
        return;
      }

      npcScriptData[script.tag] = script;
    });

    setContentKey('npcScripts', npcScriptData);
  }

  private loadRecipes() {
    const tradeskillRecipeData: Record<string, IRecipe[]> = {};
    const allRecipeData: Record<string, IRecipe> = {};

    this.chooseConfigFileOrPreset('recipes', realJSON(recipes)).forEach(
      (recipe) => {
        if (allRecipeData[recipe.name]) {
          consoleWarn(
            'ContentManager:LoadRecipes',
            `Duplicate recipe ${recipe.name}, skipping...`,
          );
          return;
        }

        tradeskillRecipeData[recipe.recipeType] ??= [];
        tradeskillRecipeData[recipe.recipeType].push(recipe as IRecipe);

        allRecipeData[recipe.name] = recipe as IRecipe;
      },
    );

    this.game.modkitManager.modRecipes.forEach((recipe) => {
      if (allRecipeData[recipe.name]) {
        consoleWarn(
          'ContentManager:LoadRecipesMod',
          `Duplicate recipe (mod) ${recipe.name}, skipping...`,
        );
        return;
      }

      tradeskillRecipeData[recipe.recipeType] =
        tradeskillRecipeData[recipe.recipeType] || [];
      tradeskillRecipeData[recipe.recipeType].push(recipe as IRecipe);

      allRecipeData[recipe.name] = recipe as IRecipe;
    });

    setContentKey('tradeskillRecipes', tradeskillRecipeData);
    setContentKey('allRecipes', allRecipeData);
  }

  private loadSpawners() {
    const spawnerData = {};

    this.chooseConfigFileOrPreset('spawners', realJSON(spawners)).forEach(
      (cur) => {
        if (spawnerData[cur.tag]) {
          consoleWarn(
            'ContentManager:LoadSpawners',
            `Duplicate spawner ${cur.tag}, skipping...`,
          );
          return;
        }

        spawnerData[cur.tag] = cur;
      },
    );

    this.game.modkitManager.modSpawners.forEach((spawner) => {
      if (spawnerData[spawner.tag]) {
        consoleWarn(
          'ContentManager:LoadSpawnersMod',
          `Duplicate spawner (mod) ${spawner.tag}, skipping...`,
        );
        return;
      }

      spawnerData[spawner.tag] = spawner;
    });

    setContentKey('spawners', spawnerData);
  }
}
