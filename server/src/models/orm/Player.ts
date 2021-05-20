
import { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { Alignment, Allegiance, BaseClass, BGM, BoundedNumber, CharacterCurrency,
  Direction, IAccountBank, ICharacterItems, ICharacterQuests, ICharacterTraits,
  IEffectContainer, IMacroCommandArgs, IPlayer, ICharacterStatistics, LearnedSpell,
  SkillBlock, StatBlock, ICharacterLockers, IMaterialStorage,
  SubscriptionTier, ICharacterPouch, INPC, TradeskillBlock } from '../../interfaces';
import { BaseEntity, PROP_SERVER_ONLY, PROP_TEMPORARY, PROP_UNSAVED_SHARED } from '../BaseEntity';

type CommandCallback = () => void & { args: IMacroCommandArgs };

@Entity()
export class Player extends BaseEntity implements IPlayer {

  // relation props
  @Property(PROP_SERVER_ONLY()) _account: ObjectId;
  @Property(PROP_SERVER_ONLY()) _items: ObjectId;
  @Property(PROP_SERVER_ONLY()) _traits: ObjectId;
  @Property(PROP_SERVER_ONLY()) _quests: ObjectId;
  @Property(PROP_SERVER_ONLY()) _statistics: ObjectId;
  @Property(PROP_SERVER_ONLY()) _lockers: ObjectId;

  @Property(PROP_UNSAVED_SHARED()) items: ICharacterItems;
  @Property(PROP_UNSAVED_SHARED()) traits: ICharacterTraits;
  @Property(PROP_UNSAVED_SHARED()) quests: ICharacterQuests;
  @Property(PROP_UNSAVED_SHARED()) bank: IAccountBank;
  @Property(PROP_UNSAVED_SHARED()) statistics: ICharacterStatistics;
  @Property(PROP_UNSAVED_SHARED()) lockers: ICharacterLockers;
  @Property(PROP_UNSAVED_SHARED()) accountLockers: ICharacterLockers & IMaterialStorage & ICharacterPouch;

  // client-useful props
  @Property(PROP_UNSAVED_SHARED()) dir = Direction.South;
  @Property(PROP_UNSAVED_SHARED()) swimLevel = 0;
  @Property(PROP_UNSAVED_SHARED()) username: string;
  @Property(PROP_UNSAVED_SHARED()) subscriptionTier: SubscriptionTier;
  @Property(PROP_UNSAVED_SHARED()) fov = {};
  @Property(PROP_UNSAVED_SHARED()) agro = {};
  @Property(PROP_UNSAVED_SHARED()) totalStats: StatBlock;
  @Property(PROP_UNSAVED_SHARED()) isGM: boolean;
  @Property(PROP_UNSAVED_SHARED()) isTester: boolean;
  @Property(PROP_UNSAVED_SHARED()) combatTicks = 0;
  @Property(PROP_UNSAVED_SHARED()) bgmSetting = 'wilderness' as BGM;
  @Property(PROP_UNSAVED_SHARED()) spellCooldowns: Record<string, number>;
  @Property(PROP_UNSAVED_SHARED()) allTraits: Record<string, number>;
  @Property(PROP_UNSAVED_SHARED()) dailyItems: Record<string, number>;

  // temporary props
  @Property(PROP_TEMPORARY()) swimElement = '';
  @Property(PROP_TEMPORARY()) flaggedSkills = [];
  @Property(PROP_TEMPORARY()) actionQueue: { fast: CommandCallback[]; slow: CommandCallback[] } = { fast: [], slow: [] };
  @Property(PROP_TEMPORARY()) lastTileDesc = '';
  @Property(PROP_TEMPORARY()) lastRegionDesc = '';
  @Property(PROP_TEMPORARY()) partyName = '';
  @Property(PROP_TEMPORARY()) lastDeathLocation;
  @Property(PROP_TEMPORARY()) isBeingForciblyRespawned: boolean;
  @Property(PROP_TEMPORARY()) spellChannel: { ticks: number; callback: () => void };
  @Property(PROP_TEMPORARY()) pets: INPC[];

  // other server props
  @Property(PROP_SERVER_ONLY()) teleportLocations: Record<string, { x: number; y: number; map: string }>;

  // all characters have these props
  @Property() uuid: string;
  @Property() name: string;
  @Property() affiliation: string;
  @Property() allegiance: Allegiance;
  @Property() alignment: Alignment;
  @Property() baseClass: BaseClass;
  @Property() gender: 'male'|'female';

  @Property() hp: BoundedNumber;
  @Property() mp: BoundedNumber;

  @Property() level: number;
  @Property() highestLevel: number;
  @Property() ancientLevel: number;
  @Property() currency: CharacterCurrency;

  @Property() map: string;
  @Property() x: number;
  @Property() y: number;
  @Property() z: number;

  @Property() stats: StatBlock;
  @Property() skills: SkillBlock;
  @Property() paidSkills: SkillBlock;
  @Property() effects: IEffectContainer;
  @Property() allegianceReputation: Partial<Record<Allegiance, number>> = {};

  // player-specific props
  @Property() exp: number;
  @Property() axp: number;
  @Property() charSlot: number;
  @Property() gainingAXP: boolean;

  @Property() hungerTicks: number;

  @Property() learnedSpells: Record<string, LearnedSpell>;

  @Property() respawnPoint: { x: number; y: number; map: string };

  @Property() runes: string[];
  @Property() learnedRunes: string[];

  @Property() tradeskills: TradeskillBlock;
  @Property() learnedRecipes: string[];
}
