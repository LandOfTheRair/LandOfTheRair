import { Currency, Holiday, ItemSlot } from './building-blocks';
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
  GiveSelfEffect = 'giveSelfEffect',
  CheckEffect = 'checkEffect',
  GiveCurrency = 'giveCurrency',
  CheckQuest = 'checkQuest',
  UpdateQuest = 'updateQuest',
  CheckHoliday = 'checkHoliday',
  CheckDailyQuest = 'checkDailyQuest',
  GiveQuest = 'giveQuest',
  HasQuest = 'hasQuest',
  GiveDailyQuest = 'giveDailyQuest',
  CheckLevel = 'checkLevel',
  CheckNPCsAndDropItems = 'checkNearbyNPCsAndDropItems',
  CheckAnyHostilesNearby = 'checkAnyHostilesNearby',
  DropItems = 'dropItems',
  KillSelfSilently = 'killSelfSilently',
  GrantAchievement = 'grantAchievement',
}

// dialog items, used for check/take/give
export interface IDialogItem {
  name: string;
  amount: number; // defaults to 1
  exact?: boolean; // whether or not the item should be matched exactly
}

// requirements for some dialog options
export interface IDialogChatRequirement {
  stat?: string;
  statValue?: number;
  holiday?: Holiday;
}

// different types of dialog actions
export interface IDialogCheckQuestAction {
  quest: string;
  maxDistance?: number;
  questCompleteActions: IDialogAction[];
}

export interface IDialogHasQuestAction {
  quest: string;
  maxDistance?: number;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogUpdateQuestAction {
  quest: string;
  maxDistance?: number;
  arrayItem?: string;
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
  potency?: number;
}

export interface IDialogGiveSelfEffectAction {
  effect: string;
  duration: number;
  potency?: number;
}

export interface IDialogCheckEffectAction {
  effect: string;
  maxDistance?: number;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
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

export interface IDialogCheckNearbyHostilesAction {
  range: number;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogCheckNPCsAndDropItemsAction {
  npcs: string[];
  item: string;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogChatActionOption {
  text: string;
  action: string;
  requirement?: IDialogChatRequirement;
}

export interface IDialogChatAction {
  displayNPCSprite?: number;
  displayNPCName?: string;
  displayNPCUUID?: string;
  displayItemName?: string;
  displayItemSprite?: number;
  displayTitle?: string;
  maxDistance?: number;
  message: string;
  width?: string;
  extraClasses?: string[];
  options: IDialogChatActionOption[];
}

export interface IDropItemsAction {
  item: string;
  amount: number;
}

export interface IKillSelfSilentlyAction {
  leaveMessage?: string;
}

export interface IGrantAchievementAction {
  achievementName: string;
}

export type IDialogAction = IDialogChatAction &
  IDialogCheckItemAction &
  IDialogCheckNPCsAndDropItemsAction &
  IDialogGiveItemAction &
  IDialogTakeItemAction &
  IDialogCheckHolidayAction &
  IDialogGiveEffectAction &
  IDialogCheckLevelAction &
  IDialogGiveCurrencyAction &
  IDialogModifyItemAction &
  IDialogGiveDailyQuestAction &
  IDialogUpdateQuestAction &
  IDialogGiveQuestAction &
  IDialogCheckEffectAction &
  IDialogCheckQuestAction &
  IDialogCheckNoItemAction &
  IDialogCheckNearbyHostilesAction &
  IDialogGiveSelfEffectAction &
  IDialogCheckItemCanUpgradeAction &
  IDropItemsAction &
  IDialogHasQuestAction &
  IDialogCheckDailyQuestAction &
  IKillSelfSilentlyAction &
  IGrantAchievementAction &
  IDialogAddItemUpgradeAction & {
    type: DialogActionType;
    maxDistance?: number;
  };

export interface IDialogTree {
  keyword: Record<string, { actions: IDialogAction[] }>;
}
