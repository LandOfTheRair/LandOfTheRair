
import { BaseClass, Currency } from './building-blocks';
import { INPC } from './npc';

export interface IAIBehavior {
  init(game, npc: INPC, parser, behavior: IBehavior, props?: any): void;
  tick(game, npc: INPC): void;
}

export enum BehaviorType {
  Trainer = 'trainer',
  Vendor = 'vendor',
  Crier = 'crier'
}

export interface IVendorItem {
  item: string;
  valueSet?: number;
  valueMult?: number;
}

export interface IVendorBehavior {
  vendorCurrency: Currency;
  vendorItems: IVendorItem[];
  dailyVendorItems?: IVendorItem[];
}

export interface ITrainerBehavior {
  joinClass: BaseClass;
  trainClass: BaseClass[];
}

export interface ICrierBehavior {
  messages: string[];
}

export type IBehavior = IVendorBehavior & ITrainerBehavior & ICrierBehavior & {
  type: BehaviorType;
};
