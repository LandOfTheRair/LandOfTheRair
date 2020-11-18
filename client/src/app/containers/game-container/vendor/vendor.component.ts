import { Component, OnDestroy, OnInit } from '@angular/core';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss']
})
export class VendorComponent implements OnInit, OnDestroy {

  constructor(
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {}

}
