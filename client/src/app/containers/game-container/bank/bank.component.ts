import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import { IPlayer } from '../../../../interfaces';
import { GameState, HideBankWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
})
export class BankComponent implements OnInit {
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
  ) {}

  ngOnInit() {
    this.posSub = this.curPos$.subscribe((pos) => {
      if (!pos) return;
      if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;

      if (this.bankInfo.npcUUID) {
        this.store.dispatch(new HideBankWindow());
        this.store.dispatch(new HideWindow('bank'));
      }
    });

    this.bankInfoSub = this.bank$.subscribe((data) => {
      this.bankInfo = cloneDeep(data || {});
    });

    this.gameStatusSub = this.inGame$.subscribe(() => {
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
