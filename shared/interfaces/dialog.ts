
import { ItemSlot } from './building-blocks';

export enum IDialogActionType {
  Chat = 'chat',
  CheckItem = 'checkItem',
  TakeItem = 'takeItem',
  GiveItem = 'giveItem',
  GiveEffect = 'giveEffect'
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
  statValue?: string;
}

// different types of actions
export interface IDialogGiveEffectAction {
  effect: string;
  duration: number;
}

export interface IDialogGiveItemAction {
  slot: ItemSlot[];
  item: IDialogItem[];
}

export interface IDialogTakeItemAction {
  slot: ItemSlot[];
  item: IDialogItem[];
}

export interface IDialogCheckItemAction {
  slot: ItemSlot[];
  item: IDialogItem[];
  checkPassActions: IDialogAction[];
  checkFailActions: IDialogAction[];
}

export interface IDialogChatAction {
  message: string;
  options: Array<{ text: string, action: string, requirement?: IDialogRequirement }>;
}

export type IDialogAction = IDialogChatAction & IDialogCheckItemAction & IDialogGiveItemAction & IDialogTakeItemAction & IDialogGiveEffectAction;

export interface IDialogTree {
  keyword: Record<string, IDialogAction[]>;
}
