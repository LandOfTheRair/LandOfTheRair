import { Component, NgZone, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { GameServerEvent, IPlayer } from '../../../../models';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';
import { MapRenderGame } from './phasergame';
import { MapScene, PreloadScene } from './phaserstates';

const Phaser = (window as any).Phaser;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  public map = new BehaviorSubject<any>(null);
  public currentPlayer = new BehaviorSubject<IPlayer>(null);

  // TODO: change this to loading text
  public loadPercent = new BehaviorSubject<number>(0);
  public loadPercent$ = this.loadPercent.asObservable();

  private game: MapRenderGame;

  constructor(
    private gameService: GameService,
    private socketService: SocketService,
    private zone: NgZone
  ) { }

  ngOnInit() {

    // play game when we get the signal and have a valid map
    combineLatest(
      this.gameService.playGame$,
      this.gameService.currentPlayer$,
      this.gameService.currentMap$
    ).subscribe(([play, player, map]) => {
      if (!play || !player || !map) return;
      this.map.next(map);
      this.currentPlayer.next(player);

      if (!this.game) {
        this.zone.runOutsideAngular(() => {
          this.initMap();
        });
      }
    });

    // reset when we get a quit signal
    this.gameService.quitGame$.subscribe(() => {
      if (this.game) {
        this.game.destroy(true);
        this.game = null;
      }

      this.map.next(null);
      this.loadPercent.next(0);
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

    this.game = new MapRenderGame(
      config,
      this.gameService,
      this.socketService,
      {
        loadPercent: this.loadPercent,
        player: this.currentPlayer,
        map: this.map
      }
    );
  }

}
