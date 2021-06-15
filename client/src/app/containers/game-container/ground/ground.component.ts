import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { sumBy } from 'lodash';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';
import { IGround, IGroundItem, IPlayer, ISimpleItem, ItemClass } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-ground',
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.scss']
})
export class GroundComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.currentGround) ground$: Observable<IGround>;

  playerSub: Subscription;
  groundSub: Subscription;

  public currentItemClass: ItemClass;

  public player: IPlayer;
  public ground: IGround;
  public groundGroups: Array<{ itemClass: ItemClass; name: string; count: number; value?: number }>;
  public currentGround: Partial<Record<ItemClass, IGroundItem[]>> = {};

  constructor(
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.groundSub = this.ground$
      .subscribe(ground => {
        this.currentGround = ground;
        this.setGround();
      });

    this.playerSub = this.player$.subscribe(p => this.player = p);
  }

  ngOnDestroy() {}

  setGround() {
    if (!this.currentGround) return;
    const ground = this.currentGround;

    this.groundGroups = Object.keys(ground || {})
      .filter(g => g !== ItemClass.Coin)
      .filter(g => ground[g].length > 0)
      .map(groundGroup => ({
          itemClass: groundGroup as ItemClass,
          name: ground[groundGroup][0].item.name,
          sprite: groundGroup === ItemClass.Corpse
                ? ground[groundGroup][0].item.mods.sprite
                : (ground[groundGroup][0].item.mods.sprite ?? null),
          count: sumBy(ground[groundGroup], 'count')
        }));

    if (ground[ItemClass.Coin]?.length > 0) {
      this.groundGroups.unshift({
        itemClass: ItemClass.Coin,
        name: ground[ItemClass.Coin][0].item.name,
        count: ground[ItemClass.Coin][0].item.mods.value,
        value: ground[ItemClass.Coin][0].item.mods.value
      });
    }
  }

  changeItemClass(iClass: ItemClass) {
    this.currentItemClass = iClass;
  }

  groundItemTrackBy(item: ISimpleItem): string {
    return item.uuid;
  }

}
