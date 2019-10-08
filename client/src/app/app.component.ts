import { Component } from '@angular/core';
import { GameService } from './game.service';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    public socketService: SocketService,
    public gameService: GameService
  ) {}

}
