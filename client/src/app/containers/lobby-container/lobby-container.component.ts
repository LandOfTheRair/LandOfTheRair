import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { OptionsService } from '../../services/options.service';

@Component({
  selector: 'app-lobby-container',
  templateUrl: './lobby-container.component.html',
  styleUrls: ['./lobby-container.component.scss']
})
export class LobbyContainerComponent implements OnInit {

  constructor(public optionsService: OptionsService, public gameService: GameService) { }

  ngOnInit() {
  }

}
