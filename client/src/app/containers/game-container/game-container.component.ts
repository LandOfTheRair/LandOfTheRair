import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { GameServerResponse } from '../../../interfaces';
import { GameService } from '../../services/game.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-game-container',
  templateUrl: './game-container.component.html',
  styleUrls: ['./game-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameContainerComponent implements OnInit {
  private socketService = inject(SocketService);
  public gameService = inject(GameService);

  constructor() {}

  ngOnInit() {
    this.socketService.registerComponentCallback(
      'GameContainer',
      GameServerResponse.DialogChat,
      (data) => {
        this.gameService.showCommandableDialog(data);
      },
    );
  }
}
