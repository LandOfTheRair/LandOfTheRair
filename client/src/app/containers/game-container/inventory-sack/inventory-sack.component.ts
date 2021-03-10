import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable } from 'rxjs';
import { IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-inventory-sack',
  templateUrl: './inventory-sack.component.html',
  styleUrls: ['./inventory-sack.component.scss']
})
export class InventorySackComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;

  constructor(
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
