
import { ItemSlot } from './building-blocks';
import { IItem } from './item';

export enum DialogActionType {
  Chat = 'chat',
  CheckItem = 'checkItem',
  TakeItem = 'takeItem',
  GiveItem = 'giveItem',
  GiveEffect = 'giveEffect',
  CheckQuest = 'checkQuest',
  GiveQuest = 'giveQuest',
  CheckLevel = 'checkLevel',
  ModifyItem = 'modifyItem'
}

// dialog items, used for check/take/give
export interface IDialogItem {
  name: string;
  amount: number; // defaults to 1
  owner?: string; // if present, we care about the owner
}

// requirements for some dialog options
export interface IDialogRequirement {
  stat?: string;
  statValue?: number;
}

// different types of dialog actions
export interface IDialogCheckQuestAction {
  quest: string;
  maxDistance?: number;
}

export interface IDialogGiveQuestAction {
  quest: string;
  maxDistance?: number;
}

export interface IDialogGiveEffectAction {
  effect: string;
  duration: number;
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
  slot: ItemSlot[];
  item: IDialogItem;
}

export interface IDialogCheckItemAction {
  fromHands?: boolean;
  fromSack?: boolean;
  slot: ItemSlot[];
  item: IDialogItem;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogCheckLevelAction {
  level: number;
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
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
                          & IDialogCheckLevelAction
                          & { type: DialogActionType, maxDistance?: number };

export interface IDialogTree {
  keyword: Record<string, { actions: IDialogAction[] }>;
}
