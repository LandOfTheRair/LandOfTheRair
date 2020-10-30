import { BehaviorSubject, Observable } from 'rxjs';

import { IMapData, IPlayer } from '../../../../interfaces';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';

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
      allPlayers: Observable<any>
    }
    ) {
      super(config);
  }
}
