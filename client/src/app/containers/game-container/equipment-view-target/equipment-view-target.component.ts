import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { IPlayer } from '../../../../interfaces';
import { GameState, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-equipment-view-target',
  templateUrl: './equipment-view-target.component.html',
  styleUrls: ['./equipment-view-target.component.scss'],
})
export class EquipmentViewTargetComponent {
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.inspectingCharacter) char$: Observable<IPlayer>;

  gameStatusSub: Subscription;

  private store = inject(Store);
  public uiService = inject(UIService);
  public gameService = inject(GameService);
  
  constructor() {
    this.gameStatusSub = this.inGame$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.store.dispatch(new HideWindow('equipmentViewTarget'));
      });
  }
}
