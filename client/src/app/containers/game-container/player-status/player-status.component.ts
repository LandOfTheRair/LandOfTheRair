import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';
import { IPlayer, IStatusEffect } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { calculateXPRequiredForLevel } from '../../../../interfaces';
import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-player-status',
  templateUrl: './player-status.component.html',
  styleUrls: ['./player-status.component.scss']
})
export class PlayerStatusComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;
  public player: IPlayer;
  public effects: IStatusEffect[] = [];

  playerSub: Subscription;

  constructor(
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.playerSub = this.player$.subscribe(p => this.setPlayer(p));
  }

  ngOnDestroy() {}

  private setPlayer(p) {
    this.player = p;
    this.effects = this.getEffects(p);
  }

  trackEffectBy(effect: IStatusEffect) {
    return effect.uuid;
  }

  getEffects(player: IPlayer): IStatusEffect[] {
    if (!player) return [];

    console.log(player.effects.buff);

    return [
      ...player.effects.buff,
      ...player.effects.debuff,
      ...player.effects.incoming,
      ...player.effects.outgoing
    ];
  }

  xpPercent(player: IPlayer) {
    const playerXP = player.exp;
    const curPlayerLevelXP = calculateXPRequiredForLevel(player.level);
    const nextPlayerLevelXP = calculateXPRequiredForLevel(player.level + 1);

    return (playerXP - curPlayerLevelXP) / nextPlayerLevelXP * 100;
  }

}
