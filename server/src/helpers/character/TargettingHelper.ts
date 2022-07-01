
import { Injectable } from 'injection-js';

import { Alignment, Allegiance, Hostility, ICharacter, INPC, IPlayer, isHostileTo, Stat } from '../../interfaces';
import { BaseService } from '../../models/BaseService';
import { WorldManager } from '../data';
import { CharacterHelper } from './CharacterHelper';
import { VisibilityHelper } from './VisibilityHelper';

interface TargettingOpts {
  self: boolean;
  party: boolean;
  pet: boolean;
  agro: boolean;
  faction: boolean;
  allegiance: boolean;
  evil: boolean;
  friendly: boolean;
  def: boolean;
}

@Injectable()
export class TargettingHelper extends BaseService {

  constructor(
    private worldManager: WorldManager,
    private characterHelper: CharacterHelper,
    private visibilityHelper: VisibilityHelper
  ) {
    super();
  }

  public init() {}

  public isVisibleTo(ref: ICharacter, target: ICharacter, useSight = true): boolean {
    if ((ref as INPC).hostility === 'Never') return true;
    if (!ref.fov && useSight) return false;

    if (ref.fov && useSight) {
      const offsetX = target.x - ref.x;
      const offsetY = target.y - ref.y;
      return this.visibilityHelper.canSee(ref, offsetX, offsetY);
    }

    return true;
  }

  // hostility check: order is important
  // important: updates to this _might_ need to be made to client/hostilityLevelFor()
  public checkTargetForHostility(
    me: ICharacter,
    target: ICharacter,
    targetOpts: TargettingOpts = {
      agro: true,
      allegiance: true,
      evil: true,
      faction: true,
      party: true,
      pet: true,
      self: true,
      friendly: true,
      def: false
    }
  ): boolean {

    // I can never be hostile to myself
    if (targetOpts.self && me === target) return false;

    // GMs are never hostile
    if (target.allegiance === Allegiance.GM) return false;

    // if one of the creatures is an NPC, and one of the monsters has a grouping of NeverAttack, don't do it
    if (!this.game.characterHelper.isPlayer(me) && !this.game.characterHelper.isPlayer(target)) {
      if ((me as INPC).monsterGroup === 'NeverAttack' ||  (target as INPC).monsterGroup === 'NeverAttack') return false;
    }

    // players and enemies are always hostile
    if (this.game.characterHelper.isPlayer(me) && target.allegiance === Allegiance.Enemy
    || this.game.characterHelper.isPlayer(target) && me.allegiance === Allegiance.Enemy) return true;

    // natural resources are only hostile if I have a reputation modifier for them (positive or negative)
    if (target.allegiance === Allegiance.NaturalResource && !me.allegianceReputation?.NaturalResource) return targetOpts.def;

    // I shouldn't be hostile towards my party members
    if (targetOpts.party && (me as IPlayer).partyName && (me as IPlayer).partyName === (target as IPlayer).partyName) return false;

    // if I am a pet (owned by a player), and my prospective target is a player, we won't do this
    if (targetOpts.pet && (me as INPC).owner && this.game.characterHelper.isPlayer(target)) return targetOpts.def;

    // if either of us are agro'd to each other, there is hostility
    if (targetOpts.agro && (me.agro[target.uuid] || target.agro[me.uuid])) return !targetOpts.def;

    // if the target is friendly and we care about that
    const targetHostility: Hostility = (target as INPC).hostility ?? Hostility.OnHit;
    if (targetOpts.friendly && [Hostility.Never, Hostility.OnHit].includes(targetHostility)) return false;

    // if the target is disguised, and my wil is less than the targets cha, he is not hostile to me
    if (this.game.effectHelper.hasEffect(target, 'Disguise')
    && this.game.characterHelper.getStat(me, Stat.WIL) < this.game.characterHelper.getStat(target, Stat.CHA)) return false;

    // if my hostility is based on faction, and either the target or my faction is hostile to each other, yes
    if (targetOpts.faction
    && (me as INPC).hostility === Hostility.Faction
    && (isHostileTo(me, target.allegiance)
       || isHostileTo(target, me.allegiance))) return !targetOpts.def;

    // if either of us is an npc and always hostile and not same monster group, yes
    const isSomeoneHostileAlways = (me as INPC).hostility === Hostility.Always || targetHostility === Hostility.Always;
    const areTargetsDifferentGroups = (me as INPC).monsterGroup !== (target as INPC).monsterGroup;
    if (isSomeoneHostileAlways && areTargetsDifferentGroups) return !targetOpts.def;

    // if we are of the same allegiance, no hostility
    if (targetOpts.allegiance && me.allegiance === target.allegiance) return targetOpts.def;

    // if I am evil, all do-gooders are hostile
    if (targetOpts.evil && me.alignment === Alignment.Evil && target.alignment === Alignment.Good) return !targetOpts.def;

    // no hostility (by default)
    return targetOpts.def;
  }

  public isTargetInViewRange(player: ICharacter, target: ICharacter, useSight = true): boolean {
    const diffX = target.x - player.x;
    const diffY = target.y - player.y;

    if (useSight && !this.visibilityHelper.canSee(player, diffX, diffY)) return false;

    return true;
  }

  public getFirstPossibleTargetInViewRange(player: ICharacter, findStr: string, useSight = true): ICharacter {
    return this.getPossibleTargetsInViewRange(player, findStr, useSight)[0];
  }

  public getPossibleTargetsInViewRange(player: ICharacter, findStr: string, useSight = true): ICharacter[] {
    const state = this.worldManager.getMapStateForCharacter(player);
    if (!state) return [];

    const allTargets = state.getAllInRange(player, 4, [], useSight);
    const possTargets = allTargets.filter(target => {
      if (this.characterHelper.isDead(target)) return false;

      const diffX = target.x - player.x;
      const diffY = target.y - player.y;

      if (useSight && !this.visibilityHelper.canSee(player, diffX, diffY)) return false;

      // you can always see yourself
      if (useSight && player !== target && !this.game.visibilityHelper.canSeeThroughStealthOf(player, target)) return false;

      return this.doesTargetMatchSearch(target, findStr);
    });

    return possTargets;
  }

  public getPossibleAOETargets(
    caster: ICharacter | null,
    center: ICharacter | { x: number; y: number; map: string },
    radius = 0
  ): ICharacter[] {
    if (!center) return [];
    if ((center as ICharacter).name && this.game.characterHelper.isDead(center as ICharacter)) return [];

    const state = this.worldManager.getMap(center.map)?.state;
    if (!state) return [];

    const allTargets = state.getAllInRangeForAOE(center, radius, []);
    const possTargets = allTargets.filter(target => {
      if (this.characterHelper.isDead(target)) return false;

      if (caster && !this.checkTargetForHostility(caster, target, {
        agro: false,
        allegiance: false,
        evil: false,
        faction: true,
        party: true,
        pet: true,
        self: true,
        friendly: true,
        def: true
      })) return false;

      return true;
    });

    return possTargets;
  }

  public doesTargetMatchSearch(target: ICharacter, findStr: string, includes = false): boolean {
    return target.uuid === findStr
        || target.name.toLowerCase().startsWith((findStr || '').toLowerCase())
        || (includes && target.name.toLowerCase().includes((findStr || '').toLowerCase()));
  }

}
