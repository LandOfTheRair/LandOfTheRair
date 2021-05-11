
import { Alignment, Currency, Holiday, ItemSlot } from './building-blocks';
import { IItem } from './item';

export enum DialogActionType {
  Chat = 'chat',
  CheckItem = 'checkItem',
  CheckNoItem = 'checkNoItem',
  TakeItem = 'takeItem',
  GiveItem = 'giveItem',
  MergeAndGiveItem = 'mergeAndGiveItem',
  ModifyItem = 'modifyItem',
  CheckItemCanUpgrade = 'checkItemCanUpgrade',
  AddUpgradeItem = 'addItemUpgrade',
  GiveEffect = 'giveEffect',
  GiveCurrency = 'giveCurrency',
  CheckQuest = 'checkQuest',
  CheckHoliday = 'checkHoliday',
  CheckDailyQuest = 'checkDailyQuest',
  GiveQuest = 'giveQuest',
  GiveDailyQuest = 'giveDailyQuest',
  CheckLevel = 'checkLevel',
  CheckAlignment = 'checkAlignment',
  SetAlignment = 'setAlignment',
  CheckNPCsAndDropItems = 'checkNearbyNPCsAndDropItems'
}

// dialog items, used for check/take/give
export interface IDialogItem {
  name: string;
  amount: number; // defaults to 1
  exact?: boolean; // whether or not the item should be matched exactly
}

// requirements for some dialog options
export interface IDialogRequirement {
  stat?: string;
  statValue?: number;
  holiday?: Holiday;
}

// different types of dialog actions
export interface IDialogCheckQuestAction {
  quest: string;
  maxDistance?: number;
}

export interface IDialogCheckDailyQuestAction {
  quests: string[];
  npc: string;
  maxDistance?: number;
}

export interface IDialogGiveQuestAction {
  quest: string;
  maxDistance?: number;
}

export interface IDialogGiveDailyQuestAction {
  quests: string[];
  maxDistance?: number;
}

export interface IDialogGiveEffectAction {
  effect: string;
  duration: number;
}

export interface IDialogGiveCurrencyAction {
  currency: Currency;
  amount: number;
}

export interface IDialogGiveItemAction {
  slot: ItemSlot[];
  item: IDialogItem;
}

export interface IDialogModifyItemAction {
  slot: ItemSlot[];
  mods: Partial<IItem>;
}

export interface IDialogTakeItemAction {
  slot: (ItemSlot | 'sack')[];
  item: IDialogItem;
}

export interface IDialogCheckItemCanUpgradeAction {
  slot: ItemSlot;
  upgrade?: string;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogAddItemUpgradeAction {
  slot: ItemSlot;
  upgrade: string;
}

export interface IDialogCheckItemAction {
  fromHands?: boolean;
  fromSack?: boolean;
  checkProperty?: string;
  checkValue?: any;
  slot: (ItemSlot | 'sack')[];
  item: IDialogItem;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogCheckNoItemAction {
  fromHands?: boolean;
  slot: ItemSlot[];
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogCheckLevelAction {
  level: number;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogCheckHolidayAction {
  holiday: Holiday;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogCheckAlignmentAction {
  alignment: Alignment;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogCheckNPCsAndDropItemsAction {
  npcs: string[];
  item: string;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogSetAlignmentAction {
  alignment: Alignment;
}

export interface IDialogChatActionOption {
  text: string;
  action: string;
  requirement?: IDialogRequirement;
}

export interface IDialogChatAction {
  displayNPCSprite?: number;
  displayNPCName?: string;
  displayNPCUUID?: string;
  displayItemName?: string;
  displayTitle?: string;
  maxDistance?: number;
  message: string;
  options: IDialogChatActionOption[];
}

export type IDialogAction = IDialogChatAction & IDialogCheckItemAction
& IDialogGiveItemAction & IDialogTakeItemAction & IDialogGiveEffectAction
& IDialogCheckLevelAction & IDialogCheckAlignmentAction & IDialogSetAlignmentAction
& IDialogCheckItemCanUpgradeAction & IDialogAddItemUpgradeAction
& { type: DialogActionType; maxDistance?: number };

export interface IDialogTree {
  keyword: Record<string, { actions: IDialogAction[] }>;
}
