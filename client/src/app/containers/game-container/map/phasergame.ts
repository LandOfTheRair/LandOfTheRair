import { BehaviorSubject } from 'rxjs';

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
      loadPercent: BehaviorSubject<number>,
      player: BehaviorSubject<IPlayer>,
      map: BehaviorSubject<IMapData>
    }
    ) {
    super(config);
  }
}
