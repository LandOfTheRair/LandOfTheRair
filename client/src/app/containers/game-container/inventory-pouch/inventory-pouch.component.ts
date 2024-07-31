import { Component, inject } from '@angular/core';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';
import { IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-inventory-pouch',
  templateUrl: './inventory-pouch.component.html',
  styleUrls: ['./inventory-pouch.component.scss'],
})
export class InventoryPouchComponent {
  @Select(GameState.player) player$: Observable<IPlayer>;

  public gameService = inject(GameService);
}
