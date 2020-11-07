import { Component, OnInit } from '@angular/core';
import { GameServerResponse } from '../../../interfaces';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss']
})
export class GameContainerComponent implements OnInit {

  constructor(private socketService: SocketService, public gameService: GameService) { }

  ngOnInit() {
    this.socketService.registerComponentCallback(this.constructor.name, GameServerResponse.DialogChat, (data) => {
      this.gameService.showNPCDialog(data);
    });
  }

}
