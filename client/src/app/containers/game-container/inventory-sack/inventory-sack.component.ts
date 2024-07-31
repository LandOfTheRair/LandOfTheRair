import { Component, inject } from '@angular/core';
import { Select } from '@ngxs/store';

import { Observable } from 'rxjs';
import { IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-inventory-sack',
  templateUrl: './inventory-sack.component.html',
  styleUrls: ['./inventory-sack.component.scss'],
})
export class InventorySackComponent {
  @Select(GameState.player) player$: Observable<IPlayer>;

  public gameService = inject(GameService);

  depositAll() {
    this.gameService.sendCommandString('depositall');
  }
}
