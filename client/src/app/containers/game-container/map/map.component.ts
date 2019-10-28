import { Component, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest } from 'rxjs';
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

  public map = new BehaviorSubject<any>(null);

  public loadPercent = new BehaviorSubject<number>(0);
  public loadPercent$ = this.loadPercent.asObservable();

  private game: MapRenderGame;

  constructor(
    private gameService: GameService,
    private socketService: SocketService
  ) { }

  ngOnInit() {

    // play game when we get the signal and have a valid map
    combineLatest(
      this.gameService.playGame$,
      this.gameService.currentMap$
    ).subscribe(([play, map]) => {
      if (!play || !map) return;
      this.map.next(map);
      this.initMap();
    });

    // reset when we get a quit signal
    this.gameService.quitGame$.subscribe(() => {
      if (this.game) this.game.destroy(true);
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
        map: this.map
      }
    );
  }

}
