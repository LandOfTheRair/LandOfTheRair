import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { select, Store } from '@ngxs/store';

import { GameState, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-equipment-view-target',
  templateUrl: './equipment-view-target.component.html',
  styleUrls: ['./equipment-view-target.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentViewTargetComponent {
  public inGame = select(GameState.inGame);
  public char = select(GameState.inspectingCharacter);

  private store = inject(Store);
  public uiService = inject(UIService);
  public gameService = inject(GameService);

  constructor() {
    effect(
      () => {
        this.inGame();
        this.store.dispatch(new HideWindow('equipmentViewTarget'));
      },
      { allowSignalWrites: true },
    );
  }
}
