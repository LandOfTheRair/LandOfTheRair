import {
  IDynamicEventMeta,
  IItemDefinition,
  INPCDefinition,
  INPCScript,
  IQuest,
  IRecipe,
  ISpawnerData,
  Rollable,
} from '../../../shared/interfaces';

export interface IModKit {
  meta: {
    name: string;
    author: string;
    version: number;
    savedAt: number;
  };

  npcs: INPCDefinition[];
  items: IItemDefinition[];
  drops: Array<{ mapName?: string; regionName?: string; drops: Rollable[] }>;
  spawners: ISpawnerData[];
  recipes: IRecipe[];
  maps: any[];
  quests: IQuest[];
  dialogs: INPCScript[];
  events: IDynamicEventMeta[];
}
