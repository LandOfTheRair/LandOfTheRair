import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { select } from '@ngxs/store';

import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-inventory-sack',
  templateUrl: './inventory-sack.component.html',
  styleUrls: ['./inventory-sack.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorySackComponent {
  public player = select(GameState.player);

  public gameService = inject(GameService);

  depositAll() {
    this.gameService.sendCommandString('depositall');
  }
}
