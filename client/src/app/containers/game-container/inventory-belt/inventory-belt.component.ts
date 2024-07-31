import { Component, inject } from '@angular/core';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';
import { IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-inventory-belt',
  templateUrl: './inventory-belt.component.html',
  styleUrls: ['./inventory-belt.component.scss'],
})
export class InventoryBeltComponent {
  @Select(GameState.player) player$: Observable<IPlayer>;

  public gameService = inject(GameService);
}
