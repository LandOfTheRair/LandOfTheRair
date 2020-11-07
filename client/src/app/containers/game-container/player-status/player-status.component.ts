import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { calculateXPRequiredForLevel } from '../../../../interfaces';

@AutoUnsubscribe()
@Component({
  selector: 'app-player-status',
  templateUrl: './player-status.component.html',
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;

  constructor(
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  xpPercent(player: IPlayer) {
    const playerXP = player.exp;
    const curPlayerLevelXP = calculateXPRequiredForLevel(player.level);
    const nextPlayerLevelXP = calculateXPRequiredForLevel(player.level + 1);

    return (playerXP - curPlayerLevelXP) / nextPlayerLevelXP * 100;
  }

}
