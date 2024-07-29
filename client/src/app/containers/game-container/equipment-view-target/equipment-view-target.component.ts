import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { ICharacter } from '../../../../interfaces';
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
  @Select(GameState.inspectingCharacter) char$: Observable<ICharacter>;

  gameStatusSub: Subscription;

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService,
  ) {
    this.gameStatusSub = this.inGame$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.store.dispatch(new HideWindow('equipmentViewTarget'));
      });
  }
}
