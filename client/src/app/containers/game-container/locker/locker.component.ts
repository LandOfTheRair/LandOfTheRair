import { Component, effect, inject } from '@angular/core';
import { select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';

import { GameState, HideLockerWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import * as materialLayout from '../../../../assets/content/_output/materialstorage.json';
import { OptionsService } from '../../../services/options.service';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
  styleUrls: ['./locker.component.scss'],
})
export class LockerComponent {
  public curPos = select(GameState.currentPosition);
  public locker = select(GameState.currentLockerWindow);
  public inGame = select(GameState.inGame);
  public player = select(GameState.player);

  private lastPos = { x: 0, y: 0 };
  public lockerInfo: any = {};
  public lockerNames = [];
  public amount = 0;
  public allLockers = {};
  public currentLocker = '';
  public activeLockerSlot = -1;

  public get materialData() {
    return materialLayout;
  }

  private store = inject(Store);
  public uiService = inject(UIService);
  public optionsService = inject(OptionsService);
  public gameService = inject(GameService);

  constructor() {
    effect(
      () => {
        const pos = this.curPos();

        if (!pos) return;
        if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;

        if (this.lockerInfo.lockerName) {
          this.store.dispatch(new HideLockerWindow());
          this.store.dispatch(new HideWindow('locker'));
          this.lockerNames = [];
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      const player = this.player();
      const lockerInfo = this.locker();

      this.lockerInfo = cloneDeep(lockerInfo || {});

      this.allLockers = {};
      Object.assign(
        this.allLockers,
        this.lockerInfo.playerLockers || {},
        this.lockerInfo.accountLockers || {},
        player?.lockers.lockers || {},
        player?.accountLockers?.lockers || {},
      );

      if (
        player &&
        this.lockerInfo.lockerName &&
        this.lockerNames.length === 0
      ) {
        this.lockerNames = this.lockerInfo.showLockers;
        this.currentLocker = this.lockerInfo.lockerName;
        this.activeLockerSlot = this.lockerNames.findIndex(
          (x) => x === this.lockerInfo.lockerName,
        );
      }
    });

    effect(
      () => {
        this.inGame();

        this.store.dispatch(new HideLockerWindow());
        this.store.dispatch(new HideWindow('locker'));
        this.lockerNames = [];
      },
      { allowSignalWrites: true },
    );
  }

  public changeLocker(event) {
    const delta = event.deltaY > 0 ? 1 : -1;
    const curLocker = this.currentLocker;
    const curIdx = this.lockerNames.indexOf(curLocker);

    if (curIdx === 0 && delta === -1) return;
    if (curIdx === this.lockerNames.length - 1 && delta === 1) return;

    this.currentLocker = this.lockerNames[curIdx + delta];
    this.activeLockerSlot = curIdx + delta;
  }
}
