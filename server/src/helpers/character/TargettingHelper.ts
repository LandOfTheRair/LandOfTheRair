
import { Injectable } from 'injection-js';

import { Alignment, Allegiance, BaseService, Hostility, ICharacter, INPC, IPlayer } from '../../interfaces';

@Injectable()
export class TargettingHelper extends BaseService {

  constructor(
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
      return this.canSee(ref, offsetX, offsetY);
    }

    return true;
  }

  public canSee(ref: ICharacter, xOffset, yOffset) {
    if (!ref.fov) return false;
    if (!ref.fov[xOffset]) return false;
    if (!ref.fov[xOffset][yOffset]) return false;
    return true;
  }

  // hostility check: order is important
  public checkTargetForHostility(me: ICharacter, target: ICharacter): boolean {

    // I can never be hostile to myself
    if (me === target) return false;

    // GMs are never hostile
    if (target.allegiance === Allegiance.GM) return false;

    // natural resources are only hostile if I have a reputation modifier for them (positive or negative)
    if (target.allegiance === Allegiance.NaturalResource && !me.allegianceReputation.NaturalResource) return false;

    // I shouldn't be hostile towards my party members
    if ((me as IPlayer).partyName && (me as IPlayer).partyName === (target as IPlayer).partyName) return false;

    // if I am a pet (owned by a player), and my prospective target is a player, we won't do this
    // only present on server
    // TODO: pets
    // if(me.$$owner && me.$$owner.isPlayer() && target.isPlayer()) return false;

    // if either of us are agro'd to each other, there is hostility
    if (me.agro[target.uuid] || target.agro[me.uuid]) return true;

    // if the target is disguised, and my wil is less than the targets cha, he is not hostile to me
    // if(target.hasEffect('Disguise') && me.getTotalStat('wil') < target.getTotalStat('cha')) return false;

    // if my hostility is based on faction, and either the target or my faction is hostile to each other, yes
    if ((me as INPC).hostility === Hostility.Faction && (
         this.isHostileTo(me, target.allegiance)
      || this.isHostileTo(target, me.allegiance))) return true;

    // if we are of the same allegiance, no hostility
    if (me.allegiance === target.allegiance) return false;

    // if either of us is an npc and always hostile, yes
    if ((me as INPC).hostility === Hostility.Always || (target as INPC).hostility === Hostility.Always) return true;

    // if I am evil, all do-gooders are hostile
    if (me.alignment === Alignment.Evil && target.alignment === Alignment.Good) return true;

    // no hostility
    return false;
  }

  public isHostileTo(char: ICharacter, faction: Allegiance) {
    if (!char.allegianceReputation[faction]) return false;
    const rep = char.allegianceReputation[faction] ?? 0;
    return rep <= -100;
  }

  public isFriendlyTo(char: ICharacter, faction: Allegiance) {
    if (!char.allegianceReputation[faction]) return false;
    const rep = char.allegianceReputation[faction] ?? 0;
    return rep >= 100;
  }

  public isNeutralTo(char: ICharacter, faction: Allegiance) {
    if (!char.allegianceReputation[faction]) return true;
    return !this.isHostileTo(char, faction) && !this.isFriendlyTo(char, faction);
  }

}
