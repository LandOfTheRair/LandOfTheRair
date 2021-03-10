import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-inventory-belt',
  templateUrl: './inventory-belt.component.html',
  styleUrls: ['./inventory-belt.component.scss']
})
export class InventoryBeltComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;

  constructor(
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
