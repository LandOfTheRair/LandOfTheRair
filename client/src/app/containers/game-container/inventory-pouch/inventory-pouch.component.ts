import { Component, OnDestroy, OnInit } from '@angular/core';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

import { GameService } from '../../../game.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-inventory-pouch',
  templateUrl: './inventory-pouch.component.html',
  styleUrls: ['./inventory-pouch.component.scss']
})
export class InventoryPouchComponent implements OnInit, OnDestroy {

  constructor(
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
