import { BehaviorSubject, Observable } from 'rxjs';
import * as Phaser from 'phaser';

import { IGround, IMapData, INPC, IPlayer, VisualEffect } from '../../../../interfaces';
import { AssetService } from '../../../services/asset.service';
import { GameService } from '../../../services/game.service';
import { SocketService } from '../../../services/socket.service';

export class MapRenderGame extends Phaser.Game {

  constructor(
    config,
    public gameService: GameService,
    public socketService: SocketService,
    public assetService: AssetService,
    public observables: {
      loadPercent: BehaviorSubject<string>;
      hideMap: BehaviorSubject<boolean>;
      player: BehaviorSubject<IPlayer>;
      map: BehaviorSubject<IMapData>;
      allPlayers: Observable<Record<string, Partial<IPlayer>>>;
      allNPCs: Observable<Record<string, Partial<INPC>>>;
      openDoors: Observable<Record<number, boolean>>;
      ground: Observable<IGround>;
      windowChange: Observable<any>;
      vfx: Observable<{ vfx: VisualEffect; vfxX: number; vfxY: number; vfxRadius: number }>;
    }
    ) {
      super(config);
  }
}
