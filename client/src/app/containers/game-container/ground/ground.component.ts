import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { select } from '@ngxs/store';

import { sumBy } from 'lodash';

import { ItemClass } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';
import { UIService } from '../../../services/ui.service';

interface GroundGroup {
  itemClass: ItemClass;
  name: string;
  count: number;
  value?: number;
  sprite?: number;
}

@Component({
  selector: 'app-ground',
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroundComponent {
  public uiService = inject(UIService);
  public optionsService = inject(OptionsService);
  public gameService = inject(GameService);

  public player = select(GameState.player);
  public ground = select(GameState.currentGround);

  public currentItemClass = signal<ItemClass>(undefined);

  public groundGroups = computed(() => {
    const ground = this.ground();

    const baseGroups: GroundGroup[] = Object.keys(ground || {})
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
      baseGroups.unshift({
        itemClass: ItemClass.Corpse,
        name: ground[ItemClass.Corpse][0].item.name,
        sprite: ground[ItemClass.Corpse][0].item.mods.sprite,
        count: sumBy(ground[ItemClass.Corpse], 'count'),
      });
    }

    if (ground[ItemClass.Coin]?.length > 0) {
      baseGroups.unshift({
        itemClass: ItemClass.Coin,
        name: ground[ItemClass.Coin][0].item.name,
        count: ground[ItemClass.Coin][0].item.mods.value,
        value: ground[ItemClass.Coin][0].item.mods.value,
      });
    }

    return baseGroups;
  });

  changeItemClass(iClass: ItemClass) {
    this.currentItemClass.set(iClass);
  }
}
