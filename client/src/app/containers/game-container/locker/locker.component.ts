import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { combineLatest, Observable, Subscription } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPlayer } from '../../../../interfaces';
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
  @Select(GameState.currentPosition) curPos$: Observable<{
    x: number;
    y: number;
  }>;
  @Select(GameState.currentLockerWindow) locker$: Observable<any>;
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  private lastPos = { x: 0, y: 0 };
  public player: IPlayer;
  public lockerInfo: any = {};
  public lockerNames = [];
  public amount = 0;
  public allLockers = {};
  public currentLocker = '';
  public activeLockerSlot = -1;

  lockerInfoSub: Subscription;
  posSub: Subscription;
  gameStatusSub: Subscription;

  public get materialData() {
    return materialLayout;
  }

  constructor(
    private store: Store,
    public uiService: UIService,
    public optionsService: OptionsService,
    public gameService: GameService,
  ) {
    this.posSub = this.curPos$.pipe(takeUntilDestroyed()).subscribe((pos) => {
      if (!pos) return;
      if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;

      if (this.lockerInfo.lockerName) {
        this.store.dispatch(new HideLockerWindow());
        this.store.dispatch(new HideWindow('locker'));
        this.lockerNames = [];
      }
    });

    this.lockerInfoSub = combineLatest([this.locker$, this.player$])
      .pipe(takeUntilDestroyed())
      .subscribe(([lockerInfo, player]) => {
        this.lockerInfo = cloneDeep(lockerInfo || {});
        this.player = player;

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

    this.gameStatusSub = this.inGame$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.store.dispatch(new HideLockerWindow());
        this.store.dispatch(new HideWindow('locker'));
        this.lockerNames = [];
      });
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
