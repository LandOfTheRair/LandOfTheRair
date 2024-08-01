import { Component, computed, effect, inject } from '@angular/core';
import { select, Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { DateTime } from 'luxon';

import { IPlayer, ISimpleItem } from '../../../../interfaces';
import { GameState, HideVendorWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss'],
})
export class VendorComponent {
  public curPos = select(GameState.currentPosition);
  public vendor = select(GameState.currentVendorWindow);
  public inGame = select(GameState.inGame);
  public player = select(GameState.player);

  private lastPos = { x: 0, y: 0 };
  public vendorData = computed(() => cloneDeep(this.vendor()));

  public get slots() {
    return Array(20)
      .fill(null)
      .map((v, i) => i);
  }

  public get buybackSlots() {
    return Array(5)
      .fill(null)
      .map((v, i) => i);
  }

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

        if (this.vendorData()?.npcUUID) {
          this.store.dispatch(new HideVendorWindow());
          this.store.dispatch(new HideWindow('vendor'));
        }
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        this.inGame();
        this.store.dispatch(new HideVendorWindow());
        this.store.dispatch(new HideWindow('vendor'));
      },
      { allowSignalWrites: true },
    );
  }

  boughtDailyAlready(player: IPlayer, item: ISimpleItem): boolean {
    const boughtTime = player.dailyItems?.[item?.uuid];
    if (!boughtTime) return false;

    let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
    if (+theoreticalResetTime > +DateTime.fromObject({ zone: 'utc' })) {
      theoreticalResetTime = theoreticalResetTime.minus({ days: 1 });
    }

    return boughtTime > +theoreticalResetTime;
  }

  assess() {
    this.gameService.sendCommandString(`#${this.vendorData().npcUUID}, assess`);
  }

  sellall() {
    this.gameService.sendCommandString(
      `#${this.vendorData().npcUUID}, sellall`,
    );
  }
}
