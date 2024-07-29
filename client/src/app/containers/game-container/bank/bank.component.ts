import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { Observable, Subscription } from 'rxjs';

import { IPlayer } from '../../../../interfaces';
import { GameState, HideBankWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
})
export class BankComponent {
  @Select(GameState.currentPosition) curPos$: Observable<{
    x: number;
    y: number;
  }>;
  @Select(GameState.currentBankWindow) bank$: Observable<any>;
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  private lastPos = { x: 0, y: 0 };
  public bankInfo: any = {};
  public amount = 0;

  bankInfoSub: Subscription;
  posSub: Subscription;
  gameStatusSub: Subscription;

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService,
  ) {
    this.posSub = this.curPos$.pipe(takeUntilDestroyed()).subscribe((pos) => {
      if (!pos) return;
      if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;

      if (this.bankInfo.npcUUID) {
        this.store.dispatch(new HideBankWindow());
        this.store.dispatch(new HideWindow('bank'));
      }
    });

    this.bankInfoSub = this.bank$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.bankInfo = cloneDeep(data || {});
      });

    this.gameStatusSub = this.inGame$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.store.dispatch(new HideBankWindow());
        this.store.dispatch(new HideWindow('bank'));
      });
  }

  deposit(num: number) {
    this.gameService.sendCommandString(
      `#${this.bankInfo.npcUUID}, deposit ${num}`,
    );
  }

  withdraw(num: number) {
    this.gameService.sendCommandString(
      `#${this.bankInfo.npcUUID}, withdraw ${num}`,
    );
  }
}
