
import { BaseClass, Currency } from './building-blocks';
import { INPC } from './npc';

export interface IAIBehavior {
  init(game, npc: INPC, parser, behavior: IBehavior): void;
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
  Steelrose = 'steelrose',
  Succorer = 'succorer'
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
  maxLevelUpLevel: number;
  maxSkillTrain: number;
}

export interface ICrierBehavior {
  messages: string[];
}

export interface IPeddlerBehavior {
  peddleCost: number;
  peddleDesc: string;
  peddleItem: string;
  peddleCurrency?: Currency;
}

export interface IIdentifierBehavior {
  identifyCurrency?: Currency;
  identifyCost: number;
  identifyTier: number;
}

export interface ISmithBehavior {
  costPerThousand?: number;
  repairsUpToCondition?: number;
}

export interface IEncrusterBehavior {
  maxGemLevel?: number;
}

export interface IBankerBehavior {
  bankId?: string;
  branchId?: string;
}

export interface IAlchemistBehavior {
  alchOz?: number;
  alchCost?: number;
}

export interface ISuccorerBehavior {
  succorOz?: number;
}

export interface ITannerBehavior {
  maxTanLevel?: number;
}

// tslint:disable-next-line:no-empty-interface
export interface ISteelroseBehavior {
}

export type IBehavior = IVendorBehavior & ITrainerBehavior & ICrierBehavior
                      & IPeddlerBehavior & IIdentifierBehavior & ITannerBehavior & ISmithBehavior
                      & IEncrusterBehavior & IBankerBehavior & IAlchemistBehavior & ISteelroseBehavior & ISuccorerBehavior
                      &
{
  type: BehaviorType;
  props?: string[];
};
