
import { Cascade, Entity, IdentifiedReference, ManyToOne, MongoEntity, OneToOne,
  PrimaryKey, Property, SerializedPrimaryKey } from 'mikro-orm';
import { ObjectID } from 'mongodb';
import { RestrictedNumber } from 'restricted-number';

import {
  Alignment, Allegiance, BaseClass, BGM, CharacterCurrency, Direction,
  IPlayer, IStatusEffect, LearnedSpell, PROP_SERVER_ONLY, PROP_TEMPORARY, PROP_UNSAVED_SHARED, SkillBlock, StatBlock
} from '../../interfaces';

import { Account } from './Account';
import { CharacterItems } from './CharacterItems';

@Entity()
export class Player implements IPlayer, MongoEntity<Player> {

  @PrimaryKey() _id: ObjectID;
  @SerializedPrimaryKey() id: string;

  @ManyToOne() account: IdentifiedReference<Account, 'id'|'_id'>;

  // server-only props
  @Property(PROP_SERVER_ONLY()) createdAt = new Date();

  // temporary props
  @Property(PROP_UNSAVED_SHARED()) dir = Direction.South;
  @Property(PROP_UNSAVED_SHARED()) swimLevel = 0;

  @Property(PROP_TEMPORARY()) agro = {};
  @Property(PROP_TEMPORARY()) combatTicks = 0;
  @Property(PROP_TEMPORARY()) swimElement = '';
  @Property(PROP_TEMPORARY()) flaggedSkills = [];
  @Property(PROP_TEMPORARY()) actionQueue = { fast: [], slow: [] };
  @Property(PROP_TEMPORARY()) lastRegion = '';
  @Property(PROP_TEMPORARY()) lastRegionDesc = '';
  @Property(PROP_TEMPORARY()) bgmSetting = 'wilderness' as BGM;
  @Property(PROP_TEMPORARY()) partyName = '';
  @Property(PROP_TEMPORARY()) lastDeathLocation;
  @Property(PROP_TEMPORARY()) totalStats: StatBlock;

  // all characters have these props
  @Property() uuid: string;
  @Property() name: string;
  @Property() affiliation: string;
  @Property() allegiance: Allegiance;
  @Property() alignment: Alignment;
  @Property() baseClass: BaseClass;
  @Property() gender: 'male'|'female';

  @Property() hp: RestrictedNumber;
  @Property() mp: RestrictedNumber;

  @Property() level: number;
  @Property() highestLevel: number;
  @Property() currency: CharacterCurrency;

  @Property() map: string;
  @Property() x: number;
  @Property() y: number;
  @Property() z: number;

  @Property() stats: StatBlock;
  @Property() skills: SkillBlock;
  @Property() effects: { [effName: string]: IStatusEffect } = {};
  @Property() allegianceReputation: { [allegiance in Allegiance]?: number } = {};

  @OneToOne(
    () => CharacterItems,
    (item) => item.player,
    { cascade: [Cascade.ALL] }
  ) items: CharacterItems;

  // player-specific props
  @Property() exp: number;
  @Property() axp: number;
  @Property() charSlot: number;
  @Property() gainingAXP: boolean;

  @Property() hungerTicks: number;

  @Property() learnedSpells: { [spellName: string]: LearnedSpell };

  @Property() respawnPoint: { x: number, y: number, map: string };
}
