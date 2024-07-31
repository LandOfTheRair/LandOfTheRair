import { Component, inject } from '@angular/core';
import { Select } from '@ngxs/store';

import { sumBy } from 'lodash';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import {
  IGround,
  IGroundItem,
  IPlayer,
  ItemClass,
} from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-ground',
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.scss'],
})
export class GroundComponent {
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.currentGround) ground$: Observable<IGround>;

  playerSub: Subscription;
  groundSub: Subscription;

  public currentItemClass: ItemClass;

  public player: IPlayer;
  public ground: IGround;
  public groundGroups: Array<{
    itemClass: ItemClass;
    name: string;
    count: number;
    value?: number;
    sprite?: number;
  }>;
  public currentGround: Partial<Record<ItemClass, IGroundItem[]>> = {};

  public uiService = inject(UIService);
  public optionsService = inject(OptionsService);
  public gameService = inject(GameService);
  
  constructor() {
    this.groundSub = this.ground$
      .pipe(takeUntilDestroyed())
      .subscribe((ground) => {
        this.currentGround = ground;
        this.setGround();
      });

    this.playerSub = this.player$
      .pipe(takeUntilDestroyed())
      .subscribe((p) => (this.player = p));
  }

  setGround() {
    if (!this.currentGround) this.currentGround = {};

    const ground = this.currentGround;

    this.groundGroups = Object.keys(ground || {})
      .filter(
        (g) =>
          g !== ItemClass.Coin &&
          g !== ItemClass.Corpse &&
          g !== ItemClass.TrapSet,
      )
      .filter((g) => ground[g].length > 0)
      .map((groundGroup) => ({
        itemClass: groundGroup as ItemClass,
        name: ground[groundGroup][0].item.name,
        sprite: ground[groundGroup][0].item.mods.sprite ?? null,
        count: sumBy(ground[groundGroup], 'count'),
      }));

    if (ground[ItemClass.Corpse]?.length > 0) {
      this.groundGroups.unshift({
        itemClass: ItemClass.Corpse,
        name: ground[ItemClass.Corpse][0].item.name,
        sprite: ground[ItemClass.Corpse][0].item.mods.sprite,
        count: sumBy(ground[ItemClass.Corpse], 'count'),
      });
    }

    if (ground[ItemClass.Coin]?.length > 0) {
      this.groundGroups.unshift({
        itemClass: ItemClass.Coin,
        name: ground[ItemClass.Coin][0].item.name,
        count: ground[ItemClass.Coin][0].item.mods.value,
        value: ground[ItemClass.Coin][0].item.mods.value,
      });
    }
  }

  changeItemClass(iClass: ItemClass) {
    this.currentItemClass = iClass;
  }
}
