import { Component, OnInit } from '@angular/core';

import { GameServerEvent } from '../../../../models';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';
import { MapRenderGame, MapScene, PreloadScene } from './phasergame';

const Phaser = (window as any).Phaser;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  private game: MapRenderGame;

  constructor(
    private gameService: GameService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.gameService.inGame$.subscribe(inGame => {
      if (!inGame) {
        if (this.game) {
          this.game.destroy(true);
        }
        return;
      }

      this.initMap();
    });
  }

  public quitGame() {
    this.socketService.emit(GameServerEvent.QuitGame);
  }

  private initMap() {
    const config = {
      type: Phaser.WEBGL,
      backgroundColor: '#000000',
      parent: document.querySelectorAll('.map')[0] as HTMLElement,
      scale: {
        mode: Phaser.Scale.NONE,
        width: 9 * 64,
        height: 9 * 64
      },
      scene: [PreloadScene, MapScene],
      banner: false
    };

    this.game = new MapRenderGame(config);
  }

}
