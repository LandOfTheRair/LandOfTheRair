
import { BaseClass, Currency } from './building-blocks';
import { INPC } from './npc';

export interface IAIBehavior {
  init(game, npc: INPC, parser, behavior: IBehavior, props?: any): void;
  tick(game, npc: INPC): void;
}

export enum BehaviorType {
  Trainer = 'trainer',
  Vendor = 'vendor',
  Crier = 'crier',
  Peddler = 'peddler',
  Identifier = 'identifier',
  Tanner = 'tanner',
  Alchemist = 'alchemist',
  Smith = 'smith',
  Encruster = 'encruster',
  Banker = 'banker',
  Steelrose = 'steelrose'
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

// tslint:disable-next-line:no-empty-interface
export interface IPeddlerBehavior {
}

// tslint:disable-next-line:no-empty-interface
export interface IIdentifierBehavior {
}

// tslint:disable-next-line:no-empty-interface
export interface ITannerBehavior {
}

// tslint:disable-next-line:no-empty-interface
export interface ISmithBehavior {
}

// tslint:disable-next-line:no-empty-interface
export interface IEncrusterBehavior {
}

// tslint:disable-next-line:no-empty-interface
export interface IBankerBehavior {
}

// tslint:disable-next-line:no-empty-interface
export interface IAlchemistBehavior {
}

// tslint:disable-next-line:no-empty-interface
export interface ISteelroseBehavior {

}

export type IBehavior = IVendorBehavior & ITrainerBehavior & ICrierBehavior
                      & IPeddlerBehavior & IIdentifierBehavior & ITannerBehavior & ISmithBehavior
                      & IEncrusterBehavior & IBankerBehavior & IAlchemistBehavior & ISteelroseBehavior
                      &
{
  type: BehaviorType;
};
