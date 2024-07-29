import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import { ICharacter } from '../../../../interfaces';
import { GameState, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-equipment-view-target',
  templateUrl: './equipment-view-target.component.html',
  styleUrls: ['./equipment-view-target.component.scss'],
})
export class EquipmentViewTargetComponent implements OnInit {
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.inspectingCharacter) char$: Observable<ICharacter>;

  gameStatusSub: Subscription;

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService,
  ) {}

  ngOnInit() {
    this.gameStatusSub = this.inGame$.subscribe(() => {
      this.store.dispatch(new HideWindow('equipmentViewTarget'));
    });
  }
}
