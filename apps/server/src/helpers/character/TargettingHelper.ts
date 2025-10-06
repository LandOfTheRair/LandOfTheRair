import { Injectable } from 'injection-js';

import type { ICharacter, INPC, IPlayer } from '@lotr/interfaces';
import { Allegiance, Hostility, Stat } from '@lotr/interfaces';
import { distanceFrom, isHostileTo } from '@lotr/shared';
import { sampleSize } from 'lodash';
import { BaseService } from '../../models/BaseService';

interface TargettingOpts {
  allowTargettingNonHostile: boolean;
}

@Injectable()
export class TargettingHelper extends BaseService {
  public init() {}

  public isVisibleTo(
    ref: ICharacter,
    target: ICharacter,
    useSight = true,
  ): boolean {
    if (!ref.fov && useSight) return false;

    if (ref.fov && useSight) {
      const offsetX = target.x - ref.x;
      const offsetY = target.y - ref.y;
      return this.game.visibilityHelper.canSee(ref, offsetX, offsetY);
    }

    return true;
  }

  // hostility check: order is important
  // important: updates to this _might_ need to be made to client/hostilityLevelFor()
  public checkTargetForHostility(
    me: ICharacter,
    target: ICharacter,
    targetOpts: Partial<TargettingOpts> = {},
  ): boolean {
    const allowTargettingNonHostile =
      targetOpts.allowTargettingNonHostile ?? false;

    const amIAPlayer = this.game.characterHelper.isPlayer(me);
    const amIAnNPC = amIAPlayer === false;

    const isTargetAPlayer = this.game.characterHelper.isPlayer(target);
    const isTargetAnNPC = isTargetAPlayer === false;

    const amIAPet = this.game.characterHelper.isPet(me);
    const myOwner = (me as INPC).owner;

    // I cannot be hostile with myself
    if (target === me) return false;

    // I cannot be hostile towards GMs
    if (target.allegiance === Allegiance.GM) return false;

    // if either of us are in the NeverAttack group, well, no hostility
    if (amIAnNPC && isTargetAnNPC) {
      const myMonsterGroup = (me as INPC).monsterGroup;
      const targetMonsterGroup = (target as INPC).monsterGroup;

      if (
        myMonsterGroup === 'NeverAttack' ||
        targetMonsterGroup === 'NeverAttack'
      ) {
        return false;
      }
    }

    // if I'm looking at a natural resource and I don't hate it, I'm not hostile to it
    if (
      target.allegiance === Allegiance.NaturalResource &&
      !me.allegianceReputation?.NaturalResource
    ) {
      return false;
    }

    // if either of us have agro for each other, true
    if (me.agro[target.uuid] || target.agro[me.uuid]) {
      return true;
    }

    // pet logic is more limited, so we start with this
    if (amIAPet && myOwner) {
      //  I can't target my owner
      if (target === myOwner) return false;

      // if my owner is hostile to it, so am I
      return this.checkTargetForHostility(myOwner, target);
    }

    // player logic
    if (amIAPlayer) {
      // we can't be hostile towards our party members. das da rule.
      if ((me as IPlayer).partyName) {
        const myPartyName = (me as IPlayer).partyName;
        const targetPartyName = (target as IPlayer).partyName;

        if (myPartyName === targetPartyName) return false;
      }

      // if the npc isn't hostile to me by default, I won't be either
      const targetHostility: Hostility =
        (target as INPC).hostility ?? Hostility.OnHit;

      if (
        !allowTargettingNonHostile &&
        [Hostility.Never, Hostility.OnHit].includes(targetHostility)
      ) {
        return false;
      }

      // if they're an enemy, simply yes
      if (target.allegiance === Allegiance.Enemy) return true;

      // if they're always hostile, simply yes
      if (targetHostility === Hostility.Always) return true;
    }

    // npc logic
    if (amIAnNPC) {
      // if I'm an enemy, and they're a player, yes
      if (me.allegiance === Allegiance.Enemy && isTargetAPlayer) return true;

      if (
        (me as INPC).hostility === Hostility.Faction &&
        (isHostileTo(me, target.allegiance) ||
          isHostileTo(target, me.allegiance))
      ) {
        return true;
      }

      // if we're always hostile, but in different groups, lets brawl
      const isSomeoneHostileAlways =
        (me as INPC).hostility === Hostility.Always ||
        (target as INPC).hostility === Hostility.Always;

      const areTargetsDifferentGroups =
        (me as INPC).monsterGroup !== (target as INPC).monsterGroup;

      if (isSomeoneHostileAlways && areTargetsDifferentGroups) {
        return true;
      }
    }

    // if the target is disguised, I'm not going to be hostile if it's good enough
    if (
      this.game.effectHelper.hasEffect(target, 'Disguise') &&
      this.game.characterHelper.getStat(me, Stat.WIL) <
        this.game.characterHelper.getStat(target, Stat.CHA)
    ) {
      return false;
    }

    // if we're the same allegiance, barring extenuating circumstances, we're not hostile
    if (me.allegiance === target.allegiance) {
      return false;
    }

    return false;
  }

  public isTargetInViewRange(
    player: ICharacter,
    target: ICharacter,
    useSight = true,
  ): boolean {
    const diffX = target.x - player.x;
    const diffY = target.y - player.y;

    if (useSight && !this.game.visibilityHelper.canSee(player, diffX, diffY)) {
      return false;
    }

    return true;
  }

  public getFirstPossibleTargetInViewRange(
    player: ICharacter,
    findStr: string,
    useSight = true,
  ): ICharacter {
    return this.getPossibleTargetsInViewRange(player, findStr, useSight)[0];
  }

  public getFirstPossibleTargetInViewRangeThatIsntSelf(
    player: ICharacter,
    findStr: string,
    useSight = true,
  ): ICharacter {
    return this.getPossibleTargetsInViewRange(player, findStr, useSight).filter(
      (target) => target !== player,
    )[0];
  }

  public getPossibleTargetsInViewRange(
    player: ICharacter,
    findStr: string,
    useSight = true,
  ): ICharacter[] {
    const state = this.game.worldManager.getMapStateForCharacter(player);
    if (!state) return [];

    const allTargets = state.getAllInRange(player, 4, [], useSight);
    const possTargets = allTargets.filter((target) => {
      if (this.game.characterHelper.isDead(target)) return false;

      const diffX = target.x - player.x;
      const diffY = target.y - player.y;

      if (
        useSight &&
        !this.game.visibilityHelper.canSee(player, diffX, diffY)
      ) {
        return false;
      }

      // you can always see yourself
      if (
        useSight &&
        player !== target &&
        !this.game.visibilityHelper.canSeeThroughStealthOf(player, target)
      ) {
        return false;
      }

      return this.doesTargetMatchSearch(target, findStr);
    });

    return possTargets;
  }

  public getPossibleAOETargets(
    caster: ICharacter | null,
    center: ICharacter | { x: number; y: number; map: string },
    radius = 0,
    maxTargets = 12,
  ): ICharacter[] {
    if (!center) return [];
    if (
      (center as ICharacter).name &&
      this.game.characterHelper.isDead(center as ICharacter)
    ) {
      return [];
    }

    const state = this.game.worldManager.getMap(center.map)?.state;
    if (!state) return [];

    const allTargets = state.getAllInRangeForAOE(center, radius, []);
    const possTargets = allTargets.filter((target) => {
      if (this.game.characterHelper.isDead(target)) return false;

      if (
        caster &&
        !this.checkTargetForHostility(caster, target, {
          allowTargettingNonHostile: true,
        })
      ) {
        return false;
      }

      if (
        caster &&
        this.game.movementHelper.numStepsTo(caster, target) !==
          distanceFrom(caster, target)
      ) {
        return false;
      }

      return true;
    });

    return sampleSize(possTargets, maxTargets);
  }

  public getPossibleFriendlyAOETargets(
    caster: ICharacter | null,
    center: ICharacter | { x: number; y: number; map: string },
    radius = 0,
    maxTargets = 12,
  ): ICharacter[] {
    if (!center) return [];
    if (
      (center as ICharacter).name &&
      this.game.characterHelper.isDead(center as ICharacter)
    ) {
      return [];
    }

    const state = this.game.worldManager.getMap(center.map)?.state;
    if (!state) return [];

    const allTargets = state.getAllInRangeForAOE(center, radius, []);
    const possTargets = allTargets.filter((target) => {
      if (this.game.characterHelper.isDead(target)) return false;

      if (
        caster &&
        this.checkTargetForHostility(caster, target, {
          allowTargettingNonHostile: true,
        })
      ) {
        return false;
      }

      if (
        caster &&
        this.game.movementHelper.numStepsTo(caster, target) !==
          distanceFrom(caster, target)
      ) {
        return false;
      }

      return true;
    });

    return sampleSize(possTargets, maxTargets);
  }

  public doesTargetMatchSearch(
    target: ICharacter,
    findStr: string,
    includes = false,
  ): boolean {
    return (
      target.uuid === findStr ||
      target.name?.toLowerCase().startsWith((findStr || '').toLowerCase()) ||
      (includes &&
        target.name?.toLowerCase().includes((findStr || '').toLowerCase()))
    );
  }
}
