
import { Injectable } from 'injection-js';
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

  public reformatAsPartyMember(player: IPlayer, partyName: string): IPartyMember {
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
      z: player.z
    };
  }

  public createParty(leader: IPlayer, partyName: string): void {
    const party: IParty = {
      name: partyName,
      members: [leader.username]
    };

    const leaderMember = this.reformatAsPartyMember(leader, partyName);

    this.game.partyManager.addParty(party);
    this.game.partyManager.addPartyMember(leaderMember);
  }

  public joinParty(joiner: IPlayer, partyName: string): void {
    const party = this.game.partyManager.getParty(partyName);
    if (!party) return;

    party.members.push(joiner.username);

    const joinerMember = this.reformatAsPartyMember(joiner, partyName);
    this.game.partyManager.addPartyMember(joinerMember);

    this.partyMessage(party, `${joiner.name} has joined the party.`);
  }

  public leaveParty(leaver: IPlayer, sendMessage = true): void {
    const partyMember = this.game.partyManager.getPartyMember(leaver.username);
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    party.members = party.members.filter(x => x !== leaver.username);
    this.game.partyManager.removePartyMember(partyMember);

    if (party.members.length === 0) {
      this.game.partyManager.removeParty(party);
    }

    if (sendMessage) {
      this.partyMessage(party, `${leaver.name} left the party.`);
    }
  }

  public kickPartyMember(kicked: IPlayer): void {
    const partyMember = this.game.partyManager.getPartyMember(kicked.username);
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    party.members = party.members.filter(x => x !== kicked.username);
    this.game.partyManager.removePartyMember(partyMember);

    this.partyMessage(party, `${kicked.name} was kicked from the party.`);
  }

  public giveParty(newLeader: IPlayer): void {
    const partyMember = this.game.partyManager.getPartyMember(newLeader.username);
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    party.members = party.members.filter(x => x !== newLeader.username);
    party.members.unshift(newLeader.username);
  }

  public breakParty(leader: IPlayer): void {
    const partyMember = this.game.partyManager.getPartyMember(leader.username);
    if (!partyMember) return;

    const party = this.game.partyManager.getParty(partyMember.partyName);
    if (!party) return;

    this.partyMessage(party, `${party.name} was broken up.`);

    party.members.forEach(member => {
      const playerRef = this.game.playerManager.getPlayerByUsername(member);
      if (!playerRef) return;

      this.leaveParty(playerRef, false);
    });
  }

  public partyMessage(party: IParty, message: string): void {
    party.members.forEach(member => {
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
      .map(x => this.game.playerManager.getPlayerByUsername(x))
      .filter(x => {
        if (!x) return false;
        if (player.map !== x.map) return false;
        if (player.username === x.username) return false;

        return this.game.directionHelper.distFrom(player, x) < 7;
      }) as IPlayer[];
  }

  public getMultiplierBasedOnPartySize(partySize: number): number {
    if (partySize <= 4)  return 1;
    if (partySize <= 5)  return 0.85;
    if (partySize <= 6)  return 0.6;
    if (partySize <= 8)  return 0.4;
    if (partySize <= 10) return 0.2;
    return 0.05;
  }

}
