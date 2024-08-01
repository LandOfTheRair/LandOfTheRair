import { Component, computed, effect, inject } from '@angular/core';
import { select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';

import { GameState, HideBankWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss'],
})
export class BankComponent {
  public curPos = select(GameState.currentPosition);
  public bank = select(GameState.currentBankWindow);
  public inGame = select(GameState.inGame);
  public player = select(GameState.player);

  private lastPos = { x: 0, y: 0 };
  public bankData = computed(() => cloneDeep(this.bank()));
  public amount = 0;

  private store = inject(Store);
  public uiService = inject(UIService);
  public gameService = inject(GameService);

  constructor() {
    effect(
      () => {
        const pos = this.curPos();
        if (!pos) return;
        if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;

        if (this.bankData()?.npcUUID) {
          this.store.dispatch(new HideBankWindow());
          this.store.dispatch(new HideWindow('bank'));
        }
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        this.inGame();
        this.store.dispatch(new HideBankWindow());
        this.store.dispatch(new HideWindow('bank'));
      },
      { allowSignalWrites: true },
    );
  }

  deposit(num: number) {
    this.gameService.sendCommandString(
      `#${this.bankData().npcUUID}, deposit ${num}`,
    );
  }

  withdraw(num: number) {
    this.gameService.sendCommandString(
      `#${this.bankData().npcUUID}, withdraw ${num}`,
    );
  }
}
