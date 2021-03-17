
import { Injectable } from 'injection-js';
import { GameAction, IParty, IPartyMember } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class PartyManager extends BaseService {

  private allParties: Record<string, IParty> = {};
  private allPartyMembers: Record<string, IPartyMember> = {};

  public init() {}

  public tick(timer) {
    timer.startTimer('Party');

    Object.keys(this.allPartyMembers).forEach(memberUsername => {
      this.updatePartyMember(memberUsername);
    });

    Object.keys(this.allParties).forEach(partyName => {
      const party = this.getParty(partyName);
      if (!party) return;

      this.updateParty(party);
    });

    timer.stopTimer('Party');
  }

  // send a party update to the whole party
  private updateParty(party: IParty): void {
    const partyMembers = party.members.reduce((prev, cur) => {
      prev[cur] = this.getPartyMember(cur);
      return prev;
    }, {});

    party.members.forEach(member => {
      this.game.wsCmdHandler.sendToSocket(member, {
        action: GameAction.PartyUpdate,
        party,
        partyMembers
      });
    });
  }

  // update a party member with their latest
  private updatePartyMember(username: string): void {
    const member = this.game.playerManager.getPlayerByUsername(username);
    if (!member) return;

    this.allPartyMembers[username] = this.game.partyHelper.reformatAsPartyMember(member, this.allPartyMembers[username].partyName);
  }

  // getters
  public getParty(partyName: string): IParty | undefined {
    return this.allParties[partyName];
  }

  public getPartyMember(username: string): IPartyMember | undefined {
    return this.allPartyMembers[username];
  }

  // creators
  public addParty(party: IParty): void {
    this.allParties[party.name] = party;
  }

  public removeParty(party: IParty): void {
    delete this.allParties[party.name];
  }

  public addPartyMember(member: IPartyMember): void {
    this.allPartyMembers[member.username] = member;
  }

  public removePartyMember(member: IPartyMember): void {
    delete this.allPartyMembers[member.username];
    this.game.wsCmdHandler.sendToSocket(member.username, {
      action: GameAction.PartyUpdate,
      party: null,
      partyMembers: null
    });
  }

}
