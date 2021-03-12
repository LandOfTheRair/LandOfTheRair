
import { Injectable } from 'injection-js';

import { Alignment, Allegiance, Hostility, ICharacter, INPC, IPlayer, isHostileTo } from '../../interfaces';
import { BaseService } from '../../models/BaseService';
import { WorldManager } from '../data';
import { CharacterHelper } from './CharacterHelper';
import { VisibilityHelper } from './VisibilityHelper';

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
  public checkTargetForHostility(me: ICharacter, target: ICharacter): boolean {

    // I can never be hostile to myself
    if (me === target) return false;

    // GMs are never hostile
    if (target.allegiance === Allegiance.GM) return false;

    // natural resources are only hostile if I have a reputation modifier for them (positive or negative)
    if (target.allegiance === Allegiance.NaturalResource && !me.allegianceReputation?.NaturalResource) return false;

    // I shouldn't be hostile towards my party members
    if ((me as IPlayer).partyName && (me as IPlayer).partyName === (target as IPlayer).partyName) return false;

    // if I am a pet (owned by a player), and my prospective target is a player, we won't do this
    // only present on server
    // TODO: pets
    // if(me.$$owner && me.$$owner.isPlayer() && target.isPlayer()) return false;

    // if either of us are agro'd to each other, there is hostility
    if (me.agro[target.uuid] || target.agro[me.uuid]) return true;

    // if the target is disguised, and my wil is less than the targets cha, he is not hostile to me
    // TODO: disguise
    // if(target.hasEffect('Disguise') && me.getTotalStat('wil') < target.getTotalStat('cha')) return false;

    // if my hostility is based on faction, and either the target or my faction is hostile to each other, yes
    if ((me as INPC).hostility === Hostility.Faction
    && (isHostileTo(me, target.allegiance)
       || isHostileTo(target, me.allegiance))) return true;

    // if either of us is an npc and always hostile and not same monster group, yes
    const isSomeoneHostileAlways = (me as INPC).hostility === Hostility.Always || (target as INPC).hostility === Hostility.Always;
    const areTargetsDifferentGroups = (me as INPC).monsterGroup !== (target as INPC).monsterGroup;
    if (isSomeoneHostileAlways && areTargetsDifferentGroups) return true;

    // if we are of the same allegiance, no hostility
    if (me.allegiance === target.allegiance) return false;

    // if I am evil, all do-gooders are hostile
    if (me.alignment === Alignment.Evil && target.alignment === Alignment.Good) return true;

    // no hostility
    return false;
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

  public doesTargetMatchSearch(target: ICharacter, findStr: string): boolean {
    return target.uuid === findStr || target.name.toLowerCase().startsWith((findStr || '').toLowerCase());
  }

}
