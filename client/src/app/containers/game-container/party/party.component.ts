import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { getMultiplierBasedOnLevelDifference, getMultiplierBasedOnPartySize, IParty, IPartyMember, IPlayer } from '../../../../interfaces';

import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';


@AutoUnsubscribe()
@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit, OnDestroy {

  @Select(GameState.party) party$: Observable<{ party: IParty; partyMembers: IPartyMember[] }>;
  @Select(GameState.player) player$: Observable<any>;

  public party: { party: IParty; partyMembers: IPartyMember[] };
  public partySub;

  public partyXPMult = 100;

  public createOrJoinParty = '';

  constructor(
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.partySub = this.party$.subscribe(p => {
      this.party = p;
      this.partyXPMult = this.multiplier(p.party);
      console.log(p);
    });
  }

  ngOnDestroy() {
  }

  create() {
    this.gameService.sendCommandString(`party create ${this.createOrJoinParty}`);
  }

  join() {
    this.gameService.sendCommandString(`party join ${this.createOrJoinParty}`);
  }

  leave() {
    this.gameService.sendCommandString(`party leave`);
  }

  break() {
    this.gameService.sendCommandString(`party break`);
  }

  kick(member: string) {
    this.gameService.sendCommandString(`party kick ${member}`);
  }

  give(member: string) {
    this.gameService.sendCommandString(`party give ${member}`);
  }

  reset() {
    this.gameService.sendCommandString(`party resetinstances`);
  }

  multiplier(party: IParty): number {
    if (!party || !party.members) return 0;
    return getMultiplierBasedOnLevelDifference(party.levelDifference) * getMultiplierBasedOnPartySize(party.members.length) * 100;
  }

  directionTo(me: IPlayer, them: IPartyMember): string {

    if (me.username === them.username) return '✧';

    if (me.map !== them.map) return this.gameService.reformatMapName(them.map);

    return this.gameService.directionTo(me, them);
  }

}
