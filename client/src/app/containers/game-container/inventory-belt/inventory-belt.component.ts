import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { select } from '@ngxs/store';

import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-inventory-belt',
  templateUrl: './inventory-belt.component.html',
  styleUrls: ['./inventory-belt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryBeltComponent {
  public player = select(GameState.player);

  public gameService = inject(GameService);
}
