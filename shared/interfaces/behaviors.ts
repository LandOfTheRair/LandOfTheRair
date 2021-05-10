
/* eslint-disable @typescript-eslint/no-empty-interface */

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
  Succorer = 'succorer',
  Upgrader = 'upgrader',
  HallOfHeroes = 'hallofheroes',
  HPDoc = 'hpdoc',
  MPDoc = 'mpdoc',
  Binder = 'binder',
  ItemModder = 'itemmodder',
  Cosmetic = 'cosmetic',
  Buffer = 'buffer',
  Resetter = 'resetter',
  AXPSwapper = 'axpswapper',
  FurUpgrader = 'furupgrader',
  HalloweenCandy = 'halloweencandy'
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

export interface IHallOfHeroesBehavior {
  message: string;
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

export interface IHPDocBehavior {
  hpTier?: number;
}

export interface IMPDocBehavior {
  mpTier?: number;
}

export interface IUpgraderBehavior {
}

export interface ISteelroseBehavior {
}

export interface IBufferBehavior {

}

export interface IItemModderBehavior {

}

export interface IResetterBehavior {

}

export interface ICosmeticsBehavior {

}

export interface IBinderBehavior {

}

export interface IAXPSwapper {

}

export type IBehavior = IVendorBehavior & ITrainerBehavior & ICrierBehavior
& IPeddlerBehavior & IIdentifierBehavior & ITannerBehavior & ISmithBehavior
& IEncrusterBehavior & IBankerBehavior & IAlchemistBehavior & ISteelroseBehavior & ISuccorerBehavior
& IUpgraderBehavior & IHallOfHeroesBehavior & IHPDocBehavior & IMPDocBehavior
& IBufferBehavior & IItemModderBehavior & IResetterBehavior & ICosmeticsBehavior & IBinderBehavior
& IAXPSwapper &
{
  type: BehaviorType;
  props?: string[];
};
