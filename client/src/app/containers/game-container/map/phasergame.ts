import { BehaviorSubject, Observable } from 'rxjs';

import { IMapData, INPC, IPlayer } from '../../../../interfaces';
import { GameService } from '../../../services/game.service';
import { SocketService } from '../../../services/socket.service';

const Phaser = (window as any).Phaser;

export class MapRenderGame extends Phaser.Game {

  constructor(
    config,
    public gameService: GameService,
    public socketService: SocketService,
    public observables: {
      loadPercent: BehaviorSubject<string>,
      player: BehaviorSubject<IPlayer>,
      map: BehaviorSubject<IMapData>,
      allPlayers: Observable<Record<string, Partial<IPlayer>>>,
      allNPCs: Observable<Record<string, Partial<INPC>>>,
      openDoors: Observable<Record<number, boolean>>
    }
    ) {
      super(config);
  }
}
