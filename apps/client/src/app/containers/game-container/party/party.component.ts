import { Component, computed, inject } from '@angular/core';
import { select } from '@ngxs/store';

import { IParty, IPartyMember, IPlayer } from '@lotr/interfaces';

import { GameState } from '../../../../stores';

import {
  getMultiplierBasedOnLevelDifference,
  getMultiplierBasedOnPartySize,
} from '@lotr/shared';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss'],
})
export class PartyComponent {
  public party = select(GameState.party);
  public player = select(GameState.player);

  public partyXPMult = computed(() => this.multiplier(this.party()?.party) ?? 100);

  public createOrJoinParty = '';

  public gameService = inject(GameService);

  create() {
    this.gameService.sendCommandString(
      `party create ${this.createOrJoinParty}`,
    );
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
    return (
      getMultiplierBasedOnLevelDifference(party.levelDifference) *
      getMultiplierBasedOnPartySize(party.members.length) *
      100
    );
  }

  directionTo(me: IPlayer, them: IPartyMember): string {
    if (me.username === them.username) return '✧';

    if (me.map !== them.map) return this.gameService.reformatMapName(them.map);

    return this.gameService.directionTo(me, them);
  }
}
