import { Component, OnDestroy, OnInit } from '@angular/core';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription } from 'rxjs';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent implements OnInit, OnDestroy {

  playerSub: Subscription;

  constructor(
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {}

}
