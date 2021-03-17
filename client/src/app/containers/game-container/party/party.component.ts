import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { IPartyMember, IPlayer } from '../../../../interfaces';

import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';


@AutoUnsubscribe()
@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit, OnDestroy {

  @Select(GameState.party) party$: Observable<any>;
  @Select(GameState.player) player$: Observable<any>;

  public createOrJoinParty = '';

  constructor(
    public gameService: GameService
  ) { }

  ngOnInit() {
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

  directionTo(me: IPlayer, them: IPartyMember): string {

    if (me.username === them.username) return '✧';

    if (me.map !== them.map) return them.map;

    return this.gameService.directionTo(me, them);
  }

}
