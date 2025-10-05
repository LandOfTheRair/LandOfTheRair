import { Injectable } from 'injection-js';
import {
  distanceFrom,
  getMultiplierBasedOnLevelDifference,
  getMultiplierBasedOnPartySize,
} from '../../helpers';
import { IParty, IPartyMember, IPlayer } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class PartyHelper extends BaseService {
  public init() {}

  public isInParty(player: IPlayer): boolean {
    return !!this.game.partyManager.getPartyMember(player.username);
  }

  public isInSameParty(player: IPlayer, otherPlayer: IPlayer): boolean {
    const left = this.game.partyManager.getPartyMember(player.username);
    const right = this.game.partyManager.getPartyMember(otherPlayer.username);

    return !!(left && right && left.partyName === right.partyName);
  }

  public isLeader(player: IPlayer): boolean {
    const partyMember = this.game.partyManager.getPartyMember(player.username);
    if (!partyMember) return false;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return false;

    return party.members[0] === player.username;
  }

  public partyName(player: IPlayer): string {
    const partyMember = this.game.partyManager.getPartyMember(player.username);
    if (!partyMember) return '';

    return partyMember.partyName;
  }

  public reformatAsPartyMember(
    player: IPlayer,
    partyName: string,
  ): IPartyMember {
    return {
      baseClass: player.baseClass,
      hpPercent: player.hp.current / player.hp.maximum,
      mpPercent: player.mp.current / player.mp.maximum,
      level: player.level,
      map: player.map,
      name: player.name,
      partyName,
      username: player.username,
      x: player.x,
      y: player.y,
      z: player.z,
    };
  }

  public createParty(leader: IPlayer, partyName: string): void {
    const party: IParty = {
      name: partyName,
      members: [leader.username],
      highestLevel: leader.level,
      lowestLevel: leader.level,
      levelDifference: 0,
    };

    const leaderMember = this.reformatAsPartyMember(leader, partyName);
    leader.partyName = partyName;

    this.game.partyManager.addParty(party);
    this.game.partyManager.addPartyMember(leaderMember);
  }

  public joinParty(joiner: IPlayer, partyName: string): void {
    const party = this.game.partyManager.getParty(partyName);
    if (!party) return;

    party.members.push(joiner.username);

    const joinerMember = this.reformatAsPartyMember(joiner, partyName);
    this.game.partyManager.addPartyMember(joinerMember);

    joiner.partyName = partyName;

    this.partyMessage(party, `${joiner.name} has joined the party.`);

    this.clearAgroForAllPartyMembers(joiner);
    this.recalculatePartyLevels(party);
  }

  public leaveParty(leaver: IPlayer, sendMessage = true): void {
    const partyMember = this.game.partyManager.getPartyMember(leaver.username);
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    party.members = party.members.filter((x) => x !== leaver.username);
    this.game.partyManager.removePartyMember(partyMember);

    leaver.partyName = '';

    if (party.members.length === 0) {
      this.game.partyManager.removeParty(party);
    }

    if (sendMessage) {
      this.partyMessage(party, `${leaver.name} left the party.`);
    }

    this.recalculatePartyLevels(party);
  }

  public kickPartyMember(kicked: IPlayer): void {
    const partyMember = this.game.partyManager.getPartyMember(kicked.username);
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    party.members = party.members.filter((x) => x !== kicked.username);
    this.game.partyManager.removePartyMember(partyMember);

    kicked.partyName = '';

    this.partyMessage(party, `${kicked.name} was kicked from the party.`);
    this.recalculatePartyLevels(party);
  }

  public giveParty(newLeader: IPlayer): void {
    const partyMember = this.game.partyManager.getPartyMember(
      newLeader.username,
    );
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    party.members = party.members.filter((x) => x !== newLeader.username);
    party.members.unshift(newLeader.username);
  }

  public breakParty(leader: IPlayer): void {
    const partyMember = this.game.partyManager.getPartyMember(leader.username);
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    this.partyMessage(party, `${party.name} was broken up.`);

    party.members.forEach((member) => {
      const playerRef = this.game.playerManager.getPlayerByUsername(member);
      if (!playerRef) return;

      this.leaveParty(playerRef, false);
    });
  }

  public partyMessage(party: IParty, message: string): void {
    party.members.forEach((member) => {
      const playerRef = this.game.playerManager.getPlayerByUsername(member);
      if (!playerRef) return;

      this.game.messageHelper.sendSimpleMessage(playerRef, message);
    });
  }

  public getAllPartyMembersInRange(player: IPlayer): IPlayer[] {
    const partyMember = this.game.partyManager.getPartyMember(player.username);
    if (!partyMember) return [];

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return [];

    return party.members
      .map((partyMemberUsername) =>
        this.game.playerManager.getPlayerByUsername(partyMemberUsername),
      )
      .filter((partyPlayer) => {
        if (!partyPlayer) return false;
        if (player.map !== partyPlayer.map) return false;
        if (player.username === partyPlayer.username) return false;

        return distanceFrom(player, partyPlayer) < 7;
      }) as IPlayer[];
  }

  public getTotalXPMultiplier(player: IPlayer): number {
    const partyMember = this.game.partyManager.getPartyMember(player.username);
    if (!partyMember) return 1;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return 1;

    return (
      this.getMultiplierBasedOnLevelDifference(party.levelDifference) *
      this.getMultiplierBasedOnPartySize(party.members.length)
    );
  }

  public getMultiplierBasedOnPartySize(partySize: number): number {
    return getMultiplierBasedOnPartySize(partySize);
  }

  public getMultiplierBasedOnLevelDifference(level: number): number {
    return getMultiplierBasedOnLevelDifference(level);
  }

  public recalculatePartyLevels(party: IParty): void {
    const partyLevels = party.members.map(
      (x) => this.game.partyManager.getPartyMember(x)?.level ?? 1,
    );

    party.lowestLevel = Math.min(...partyLevels);
    party.highestLevel = Math.max(...partyLevels);
    party.levelDifference = party.highestLevel - party.lowestLevel;
  }

  private clearAgroForAllPartyMembers(newJoiner: IPlayer): void {
    const partyMember = this.game.partyManager.getPartyMember(
      newJoiner.username,
    );
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    party.members.forEach((member) => {
      const playerRef = this.game.playerManager.getPlayerByUsername(member);
      if (!playerRef) return;

      this.game.characterHelper.clearAgro(newJoiner, playerRef);
      this.game.characterHelper.clearAgro(playerRef, newJoiner);
    });
  }
}
