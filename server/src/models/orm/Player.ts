import { ObjectId } from 'mongodb';
import { Entity, Property } from '../../helpers/core/db/decorators';
import {
  Alignment,
  Allegiance,
  BaseClass,
  BGM,
  BoundedNumber,
  CharacterCurrency,
  Direction,
  IAccountAchievements,
  IAccountBank,
  ICharacter,
  ICharacterItems,
  ICharacterLockers,
  ICharacterPouch,
  ICharacterQuests,
  ICharacterStatistics,
  ICharacterTraits,
  IEffectContainer,
  IMacroCommandArgs,
  IMaterialStorage,
  INPC,
  IPlayer,
  ISessionStatistics,
  LearnedSpell,
  SkillBlock,
  StatBlock,
  SubscriptionTier,
  TradeskillBlock,
} from '../../interfaces';
import {
  BaseEntity,
  PROP_SERVER_ONLY,
  PROP_TEMPORARY,
  PROP_UNSAVED_SHARED,
} from '../BaseEntity';

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

  @Property(PROP_UNSAVED_SHARED()) guildId: string;

  @Property(PROP_UNSAVED_SHARED()) items: ICharacterItems;
  @Property(PROP_UNSAVED_SHARED()) traits: ICharacterTraits;
  @Property(PROP_UNSAVED_SHARED()) quests: ICharacterQuests;
  @Property(PROP_UNSAVED_SHARED()) bank: IAccountBank;
  @Property(PROP_UNSAVED_SHARED()) statistics: ICharacterStatistics;
  @Property(PROP_UNSAVED_SHARED()) lockers: ICharacterLockers;
  @Property(PROP_UNSAVED_SHARED()) accountLockers: ICharacterLockers &
    IMaterialStorage &
    ICharacterPouch;
  @Property(PROP_UNSAVED_SHARED()) achievements: IAccountAchievements;

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
  @Property(PROP_TEMPORARY()) actionQueue: {
    fast: CommandCallback[];
    slow: CommandCallback[];
  } = { fast: [], slow: [] };
  @Property(PROP_TEMPORARY()) lastTileDesc = '';
  @Property(PROP_TEMPORARY()) lastRegionDesc = '';
  @Property(PROP_TEMPORARY()) partyName = '';
  @Property(PROP_TEMPORARY()) skillTicks = 0;
  @Property(PROP_TEMPORARY()) lastDeathLocation;
  @Property(PROP_TEMPORARY()) isBeingForciblyRespawned: boolean;
  @Property(PROP_TEMPORARY()) spellChannel: {
    ticks: number;
    callback: () => void;
  };
  @Property(PROP_TEMPORARY()) pets: INPC[];
  @Property(PROP_TEMPORARY()) sessionStatistics: ISessionStatistics;
  @Property(PROP_TEMPORARY()) takingOver: ICharacter;
  @Property(PROP_TEMPORARY()) isTradeEnabled?: boolean;

  // other server props
  @Property(PROP_SERVER_ONLY()) teleportLocations: Record<
    string,
    { x: number; y: number; map: string }
  >;

  // all characters have these props
  @Property() uuid: string;
  @Property() name: string;
  @Property() affiliation: string;
  @Property() allegiance: Allegiance;
  @Property() alignment: Alignment;
  @Property() baseClass: BaseClass;
  @Property() gender: 'male' | 'female';

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
  @Property() allegianceReputation: Record<Allegiance, number> = {
    [Allegiance.None]: 0,
    [Allegiance.Adventurers]: 0,
    [Allegiance.Pirates]: 0,
    [Allegiance.Royalty]: 0,
    [Allegiance.Townsfolk]: 0,
    [Allegiance.Underground]: 0,
    [Allegiance.Wilderness]: 0,
    [Allegiance.Enemy]: 0,
    [Allegiance.NaturalResource]: 0,
    [Allegiance.GM]: 0,
  };

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
