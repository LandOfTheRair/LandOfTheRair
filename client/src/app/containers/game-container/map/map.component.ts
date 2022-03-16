import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import * as Phaser from 'phaser';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import OutlinePipeline from '../../../pipelines/OutlinePipeline';
import GrayPostFXPipeline from '../../../pipelines/GrayPostFXPipeline';
import { GameServerEvent, GameServerResponse, ICharacter, IGround, INPC, IPlayer, VisualEffect } from '../../../../interfaces';
import { GameState, SettingsState } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';
import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';
import { SocketService } from '../../../services/socket.service';
import { UIService } from '../../../services/ui.service';
import { FloatingBox } from './floating-box';
import { MapRenderGame } from './phasergame';
import { MapScene, PreloadScene } from './phaserstates';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  @Select(GameState.itemTooltip) public itemTooltip$: Observable<string>;

  @Select(GameState.player) private player$: Observable<IPlayer>;
  @Select(GameState.currentTarget) private currentTarget$: Observable<ICharacter>;
  @Select(GameState.players) private allPlayers$: Observable<Record<string, Partial<IPlayer>>>;
  @Select(GameState.npcs) private allNPCs$: Observable<Record<string, Partial<INPC>>>;
  @Select(GameState.openDoors) private openDoors$: Observable<Record<number, boolean>>;
  @Select(GameState.ground) private ground$: Observable<IGround>;

  // simple subjects to be passed into the map for whatever purposes
  public map = new BehaviorSubject<any>(null);
  public currentPlayer = new BehaviorSubject<IPlayer>(null);
  public currentTarget = new BehaviorSubject<ICharacter>(null);
  public allPlayers = new BehaviorSubject<Record<string, Partial<IPlayer>>>({ });
  public allNPCs = new BehaviorSubject<Record<string, Partial<INPC>>>({ });
  public openDoors = new BehaviorSubject<Record<number, boolean>>({ });
  public ground = new BehaviorSubject<IGround>({ });
  public vfx = new Subject<{ vfx: VisualEffect; vfxX: number; vfxY: number; vfxRadius: number; vfxTimeout: number }>();

  // subs
  meSub: Subscription;
  playerSub: Subscription;
  npcSub: Subscription;
  doorSub: Subscription;
  groundSub: Subscription;
  boxSub: Subscription;

  // boxes
  private allBoxes: FloatingBox[] = [];

  // hide the map behind a black screen
  private hideMap = new BehaviorSubject<boolean>(true);
  public hideMapFromView = true;

  // loading text
  private loadPercent = new BehaviorSubject<string>('');
  public loadString: string;
  public bannerString: string;
  public fadeOut: boolean;

  private game: MapRenderGame;

  private player: IPlayer;

  public get canSeeLowHealthBorder(): boolean {
    return this.player
        && this.player.hp.current <= this.player.hp.maximum * ((this.optionsService.dyingBorderPercent ?? 25) / 100)
        && this.optionsService.canShowDyingBorder;
  }

  constructor(
    private assetService: AssetService,
    public gameService: GameService,
    private socketService: SocketService,
    private store: Store,
    private zone: NgZone,
    public optionsService: OptionsService,
    public uiService: UIService
  ) { }

  ngOnInit(): void {

    this.playerSub = this.allPlayers$.subscribe(pHash => this.allPlayers.next(pHash));
    this.npcSub = this.allNPCs$.subscribe(pHash => this.allNPCs.next(pHash));
    this.doorSub = this.openDoors$.subscribe(dHash => this.openDoors.next(dHash));
    this.groundSub = this.ground$.subscribe(g => this.ground.next(g));
    this.meSub = this.player$.subscribe(p => this.player = p);

    this.boxSub = GameState.box.subscribe(data => this.createBox(data));

    this.gameService.currentMap$.subscribe(() => {
      this.hideMap.next(true);
    });

    this.socketService.registerComponentCallback('VFX', GameServerResponse.GameLog, (data) => {
      if (!data.vfx || !data.vfxX || !data.vfxY) return;

      this.vfx.next({ vfx: data.vfx, vfxX: data.vfxX, vfxY: data.vfxY, vfxRadius: data.vfxRadius ?? 0, vfxTimeout: data.vfxTimeout });
    });

    this.currentTarget$.subscribe(target => {this.currentTarget.next(target);});

    // play game when we get the signal and have a valid map
    combineLatest([
      this.gameService.playGame$,
      this.gameService.currentPlayer$,
      this.gameService.currentMap$
    ]).subscribe(([play, player, mapData]) => {
      if (!play || !player || !mapData) return;
      const areMapsDifferent = player?.map && this.currentPlayer.getValue()?.map && player?.map !== this.currentPlayer.getValue()?.map;

      this.map.next(mapData);
      this.currentPlayer.next(player);

      if (!this.game) {
        this.zone.runOutsideAngular(() => {
          this.initMap();
        });
      }

      if (this.game && areMapsDifferent) {
        this.zone.runOutsideAngular(() => {
          this.game.scene.getScene('MapScene')?.scene.restart({ hideWelcome: true, resetVisibilityFlags: true });
        });
      }
    });

    // have to do it this way so zone doesn't lose it's mind
    this.loadPercent.subscribe(d => {
      this.zone.run(() => {

        // if we don't have anything, we set a fadeout boolean and then trigger css animations
        if (!d) {
          this.fadeOut = true;

          setTimeout(() => {
            this.loadString = d;
            this.fadeOut = false;
          }, 5000);

          return;
        }

        // if we do have something, we just set it
        this.loadString = d;
        this.fadeOut = false;
      });
    });

    // have to do it this way so zone doesn't lose it's mind
    this.gameService.bannerMessage$.subscribe(d => {
      this.zone.run(() => {

        // if we do have something, we just set it
        this.bannerString = d;
        this.fadeOut = false;

        setTimeout(() => {
          this.fadeOut = true;

          setTimeout(() => {
            this.fadeOut = false;
            this.bannerString = '';
          }, 2000);
        }, 1000);
      });
    });

    this.hideMap.subscribe(d => {
      this.hideMapFromView = d;
    });

    // reset when we get a quit signal
    this.gameService.quitGame$.subscribe(() => {
      if (this.game) {
        this.game.destroy(true);
        this.game = null;
        this.allBoxes.forEach(b => b.clearSelf());
      }

      this.map.next(null);
      this.loadPercent.next('');
    });
  }

  ngOnDestroy(): void {}

  private createBox(boxData) {
    const box = new FloatingBox(boxData.side, boxData.color, boxData.text);
    box.init(document.querySelectorAll('.map')[0], () => this.allBoxes = this.allBoxes.filter(x => x !== box));
    this.allBoxes.push(box);
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
      banner: false,
      pixelArt: true,
      pipeline: { OutlinePipeline, GrayPostFXPipeline }
    };

    this.game = new MapRenderGame(
      config,
      this.gameService,
      this.socketService,
      this.assetService,
      {
        loadPercent: this.loadPercent,
        hideMap: this.hideMap,
        player: this.currentPlayer,
        target: this.currentTarget,
        map: this.map,
        allPlayers: this.allPlayers,
        allNPCs: this.allNPCs,
        openDoors: this.openDoors,
        ground: this.ground,
        vfx: this.vfx,
        windowChange: this.store.select(SettingsState.window).pipe(map(x => x('map')))
      }
    );

    // eslint-disable-next-line no-underscore-dangle
    (window as any).__game = this.game;

    this.game.scene.add('PreloadScene', PreloadScene);
    this.game.scene.add('MapScene', MapScene);

    this.game.scene.start('PreloadScene');
  }

}
