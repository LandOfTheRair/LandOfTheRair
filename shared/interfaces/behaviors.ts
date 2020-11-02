
import { Currency } from './building-blocks';

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
  maxSkill?: number;
  maxLevel?: number;
}

export interface ICrierBehavior {
  messages: string[];
}

export type IBehavior = IVendorBehavior & ITrainerBehavior & ICrierBehavior & {
  type: BehaviorType;
};
