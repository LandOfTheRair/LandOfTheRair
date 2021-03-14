import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';
import { IPlayer, IStatusEffect } from '../../../../interfaces';
import { GameState, ToggleWindow } from '../../../../stores';

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
    private store: Store,
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

    const base = [
      ...player.effects.buff,
      ...player.effects.debuff,
      ...player.effects.incoming,
      ...player.effects.outgoing
    ].filter(x => !x.effectInfo.hidden);

    if (player.spellChannel) {
      base.unshift({
        uuid: 'channel',
        effectName: 'Channeling',
        sourceName: '',
        endsAt: Date.now() + (player.spellChannel.ticks * 1000),
        effectInfo: { potency: 1 }
      });
    }

    return base;
  }

  xpPercent(player: IPlayer) {
    const playerXP = player.exp;
    const curPlayerLevelXP = calculateXPRequiredForLevel(player.level);
    const nextPlayerLevelXP = calculateXPRequiredForLevel(player.level + 1);

    return (playerXP - curPlayerLevelXP) / (nextPlayerLevelXP - curPlayerLevelXP) * 100;
  }

  unapply($event, effect: IStatusEffect): void {
    $event.stopPropagation();
    $event.preventDefault();
    this.gameService.sendCommandString(`!removeeffect ${effect.uuid}`);
  }

  showWindow(window: string): void {
    this.store.dispatch(new ToggleWindow(window));
  }

}
