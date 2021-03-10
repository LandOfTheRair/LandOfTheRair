import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { combineLatest, Observable, Subscription } from 'rxjs';

import { IPlayer } from '../../../../interfaces';
import { GameState, HideBankWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
  styleUrls: ['./locker.component.scss']
})
export class LockerComponent implements OnInit, OnDestroy {

  @Select(GameState.currentPosition) curPos$: Observable<{ x: number; y: number }>;
  @Select(GameState.currentLockerWindow) locker$: Observable<any>;
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  private lastPos = { x: 0, y: 0 };
  public player: IPlayer;
  public lockerInfo: any = {};
  public lockerRegionNames = [];
  public activeLockerSlot = -1;
  public amount = 0;

  lockerInfoSub: Subscription;
  posSub: Subscription;
  gameStatusSub: Subscription;

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.posSub = this.curPos$.subscribe((pos) => {
      if (!pos) return;
      if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;

      if (this.lockerInfo.regionId) {
        this.store.dispatch(new HideBankWindow());
        this.store.dispatch(new HideWindow('locker'));
        this.lockerRegionNames = [];
      }
    });

    this.lockerInfoSub = combineLatest([
      this.locker$,
      this.player$
    ]).subscribe(([lockerInfo, player]) => {
      this.lockerInfo = cloneDeep(lockerInfo || {});
      this.player = player;

      if (player && this.lockerInfo.lockerName && this.lockerRegionNames.length === 0) {
        const lockers = [];

        Object.keys(player.lockers?.lockers ?? {}).forEach(regionId => {
          Object.keys(player.lockers?.lockers?.[regionId] || {}).forEach(lockerId => {
            lockers.push({ regionId, lockerId });
          });
        });

        this.lockerRegionNames = lockers.filter(x => x.regionId === this.lockerInfo.regionId);
        this.activeLockerSlot = lockers.findIndex(x => x.lockerId === lockerInfo.lockerName);
      }
    });

    this.gameStatusSub = this.inGame$.subscribe(() => {
      this.store.dispatch(new HideBankWindow());
      this.store.dispatch(new HideWindow('locker'));
      this.lockerRegionNames = [];
    });
  }

  ngOnDestroy() {}


}
