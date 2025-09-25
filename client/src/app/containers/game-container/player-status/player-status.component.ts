import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { select, Store } from '@ngxs/store';
import { clamp } from 'lodash';

import { IPlayer, IStatusEffect, SilverPurchase } from '../../../../interfaces';
import { AccountState, GameState, ToggleWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { calculateXPRequiredForLevel } from '../../../../interfaces';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-player-status',
  templateUrl: './player-status.component.html',
  styleUrls: ['./player-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerStatusComponent {
  public account = select(AccountState.account);
  public player = select(GameState.player);

  public effects = computed(() => this.getEffects(this.player()));
  public showPouch = computed(
    () => !!this.account().premium.silverPurchases?.[SilverPurchase.MagicPouch],
  );

  private store = inject(Store);
  public uiService = inject(UIService);
  public gameService = inject(GameService);

  getEffects(player: IPlayer): IStatusEffect[] {
    if (!player) return [];

    const base = Object.values(player.effects._hash).filter(
      (x) => !x.effectInfo.hidden,
    );

    if (player.spellChannel) {
      base.unshift({
        uuid: 'channel',
        effectName: 'Channeling',
        sourceName: '',
        endsAt: Date.now() + player.spellChannel.ticks * 1000,
        effectInfo: { potency: 1 },
      });
    }

    return base;
  }

  xpString(player: IPlayer): string {
    return `${player.exp.toLocaleString()} / ${this.levelXP(
      player.level + 1,
    ).toLocaleString()}`;
  }

  levelXP(level: number): number {
    return calculateXPRequiredForLevel(level);
  }

  xpPercent(player: IPlayer): string {
    const playerXP = player.exp;
    const curPlayerLevelXP = this.levelXP(player.level);
    const nextPlayerLevelXP = this.levelXP(player.level + 1);

    return clamp(
      ((playerXP - curPlayerLevelXP) / (nextPlayerLevelXP - curPlayerLevelXP)) *
        100,
      0,
      100,
    ).toFixed(2);
  }

  axpPercent(player: IPlayer): string {
    const playerXP = player.axp;

    return Math.min(100, (playerXP / 500) * 100).toFixed(2);
  }

  unapply($event, effect: IStatusEffect): void {
    $event.stopPropagation();
    $event.preventDefault();

    // songs are a bit complicated 🤦‍♀️
    if (effect.effectInfo.unique === 'Song') {
      this.gameService.sendCommandString(`!removesong ${effect.uuid}`);
    } else {
      this.gameService.sendCommandString(`!removeeffect ${effect.uuid}`);
    }
  }

  showWindow(window: string): void {
    this.store.dispatch(new ToggleWindow(window));
  }
}
