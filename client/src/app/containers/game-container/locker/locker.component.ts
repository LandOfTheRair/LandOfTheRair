import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { combineLatest, Observable, Subscription } from 'rxjs';

import { IPlayer } from '../../../../interfaces';
import { GameState, HideLockerWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';
import * as materialLayout from '../../../../assets/content/_output/materialstorage.json';

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
  public lockerNames = [];
  public activeLockerSlot = -1;
  public amount = 0;
  public allLockers = {};

  lockerInfoSub: Subscription;
  posSub: Subscription;
  gameStatusSub: Subscription;

  public get materialData() {
    return materialLayout;
  }

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

      if (this.lockerInfo.lockerId) {
        this.store.dispatch(new HideLockerWindow());
        this.store.dispatch(new HideWindow('locker'));
        this.lockerNames = [];
      }
    });

    this.lockerInfoSub = combineLatest([
      this.locker$,
      this.player$
    ]).subscribe(([lockerInfo, player]) => {
      this.lockerInfo = cloneDeep(lockerInfo || {});
      this.player = player;

      this.allLockers = {};
      Object.assign(
        this.allLockers,
        this.lockerInfo.playerLockers || {},
        this.lockerInfo.accountLockers || {},
        player?.lockers.lockers || {},
        player?.accountLockers?.lockers || {}
      );

      if (player && this.lockerInfo.lockerName && this.lockerNames.length === 0) {
        this.lockerNames = this.lockerInfo.showLockers;
        this.activeLockerSlot = this.lockerNames.findIndex(x => x === this.lockerInfo.lockerName);
      }
    });

    this.gameStatusSub = this.inGame$.subscribe(() => {
      this.store.dispatch(new HideLockerWindow());
      this.store.dispatch(new HideWindow('locker'));
      this.lockerNames = [];
    });
  }

  ngOnDestroy() {}


}
