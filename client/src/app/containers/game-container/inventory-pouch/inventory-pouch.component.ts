import { Component, inject } from '@angular/core';
import { select } from '@ngxs/store';

import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-inventory-pouch',
  templateUrl: './inventory-pouch.component.html',
  styleUrls: ['./inventory-pouch.component.scss'],
})
export class InventoryPouchComponent {
  public player = select(GameState.player);

  public gameService = inject(GameService);
}
