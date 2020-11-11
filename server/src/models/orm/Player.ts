
import { ObjectId } from 'mongodb';
import { BaseEntity } from '../../helpers/core/db/base';
import { Entity, Property } from '../../helpers/core/db/decorators';
import { Alignment, Allegiance, BaseClass, BGM, BoundedNumber, CharacterCurrency,
  Direction, ICharacterItems, IEffectContainer, IPlayer, IStatusEffect, LearnedSpell,
  PROP_SERVER_ONLY,
  PROP_TEMPORARY, PROP_UNSAVED_SHARED, SkillBlock, StatBlock } from '../../interfaces';

@Entity()
export class Player extends BaseEntity implements IPlayer {

  // relation props
  @Property(PROP_SERVER_ONLY()) _account: ObjectId;
  @Property(PROP_SERVER_ONLY()) _items: ObjectId;

  @Property(PROP_UNSAVED_SHARED()) items: ICharacterItems;

  // client-useful props
  @Property(PROP_UNSAVED_SHARED()) dir = Direction.South;
  @Property(PROP_UNSAVED_SHARED()) swimLevel = 0;
  @Property(PROP_UNSAVED_SHARED()) username: string;
  @Property(PROP_UNSAVED_SHARED()) isSubscribed: boolean;
  @Property(PROP_UNSAVED_SHARED()) fov = {};
  @Property(PROP_UNSAVED_SHARED()) agro = {};
  @Property(PROP_UNSAVED_SHARED()) totalStats: StatBlock;
  @Property(PROP_UNSAVED_SHARED()) isGM: boolean;
  @Property(PROP_UNSAVED_SHARED()) isTester: boolean;

  // temporary props
  @Property(PROP_TEMPORARY()) combatTicks = 0;
  @Property(PROP_TEMPORARY()) swimElement = '';
  @Property(PROP_TEMPORARY()) flaggedSkills = [];
  @Property(PROP_TEMPORARY()) actionQueue: { fast: Array<() => void>, slow: Array<() => void> } = { fast: [], slow: [] };
  @Property(PROP_TEMPORARY()) lastTileDesc = '';
  @Property(PROP_TEMPORARY()) lastRegionDesc = '';
  @Property(PROP_TEMPORARY()) bgmSetting = 'wilderness' as BGM;
  @Property(PROP_TEMPORARY()) partyName = '';
  @Property(PROP_TEMPORARY()) lastDeathLocation;

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
  @Property() currency: CharacterCurrency;

  @Property() map: string;
  @Property() x: number;
  @Property() y: number;
  @Property() z: number;

  @Property() stats: StatBlock;
  @Property() skills: SkillBlock;
  @Property() effects: IEffectContainer;
  @Property() allegianceReputation: { [allegiance in Allegiance]?: number } = {};

  // player-specific props
  @Property() exp: number;
  @Property() axp: number;
  @Property() charSlot: number;
  @Property() gainingAXP: boolean;

  @Property() hungerTicks: number;

  @Property() learnedSpells: { [spellName: string]: LearnedSpell };

  @Property() respawnPoint: { x: number, y: number, map: string };
}
