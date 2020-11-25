import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import { IPlayer } from '../../../../interfaces';
import { GameState, HideVendorWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit, OnDestroy {

  @Select(GameState.currentPosition) curPos$: Observable<{ x: number, y: number }>;
  @Select(GameState.currentVendorWindow) vendor$: Observable<any>;
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  private lastPos = { x: 0, y: 0 };
  public vendorInfo: any = {};

  public get slots() {
    return Array(20).fill(null).map((v, i) => i);
  }

  public get buybackSlots() {
    return Array(5).fill(null).map((v, i) => i);
  }

  vendorInfoSub: Subscription;
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

      if (this.vendorInfo.npcUUID) {
        this.store.dispatch(new HideVendorWindow());
        this.store.dispatch(new HideWindow('vendor'));
      }
    });

    this.vendorInfoSub = this.vendor$.subscribe(data => {
      this.vendorInfo = cloneDeep(data || {});
    });

    this.gameStatusSub = this.inGame$.subscribe((d) => {
      this.store.dispatch(new HideVendorWindow());
      this.store.dispatch(new HideWindow('vendor'));
    });
  }

  ngOnDestroy() {}

}
