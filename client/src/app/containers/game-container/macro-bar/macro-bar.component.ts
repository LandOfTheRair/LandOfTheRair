import { Component, OnDestroy, OnInit } from '@angular/core';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

import { GameService } from '../../../game.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-macro-bar',
  templateUrl: './macro-bar.component.html',
  styleUrls: ['./macro-bar.component.scss']
})
export class MacroBarComponent implements OnInit, OnDestroy {

  constructor(
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {}

}
