import * as Phaser from 'phaser';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  ICharacter,
  IGround,
  IMapData,
  INPC,
  IPlayer,
  VisualEffect,
} from '@lotr/interfaces';
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
      target: BehaviorSubject<ICharacter>;
      map: BehaviorSubject<IMapData>;
      allPlayers: Observable<Record<string, Partial<IPlayer>>>;
      allNPCs: Observable<Record<string, Partial<INPC>>>;
      openDoors: Observable<Record<number, boolean>>;
      ground: Observable<IGround>;
      windowChange: Observable<any>;
      vfx: Observable<{
        vfx: VisualEffect;
        vfxTiles: { x: number; y: number }[];
      }>;
    },
  ) {
    super(config);
  }
}
