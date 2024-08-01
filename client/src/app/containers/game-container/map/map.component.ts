import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  NgZone,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { select, Store } from '@ngxs/store';
import * as Phaser from 'phaser';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GameServerEvent,
  GameServerResponse,
  ICharacter,
  IGround,
  INPC,
  IPlayer,
  VisualEffect,
} from '../../../../interfaces';
import { GameState, SettingsState } from '../../../../stores';
import GrayPostFXPipeline from '../../../pipelines/GrayPostFXPipeline';
import OutlinePipeline from '../../../pipelines/OutlinePipeline';
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
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  private assetService = inject(AssetService);
  public gameService = inject(GameService);
  private socketService = inject(SocketService);
  private store = inject(Store);
  private zone = inject(NgZone);
  public optionsService = inject(OptionsService);
  public uiService = inject(UIService);

  public itemTooltip = select(GameState.itemTooltip);
  public player = select(GameState.player);
  public target = select(GameState.currentTarget);
  public playerHash = select(GameState.players);
  public npcHash = select(GameState.npcs);
  public doorHash = select(GameState.openDoors);
  public groundHash = select(GameState.ground);
  public inGame = select(GameState.inGame);

  // simple subjects to be passed into the map for whatever purposes
  public map = new BehaviorSubject<any>(null);
  public currentPlayer = new BehaviorSubject<IPlayer>(null);
  public currentTarget = new BehaviorSubject<ICharacter>(null);
  public allPlayers = new BehaviorSubject<Record<string, Partial<IPlayer>>>({});
  public allNPCs = new BehaviorSubject<Record<string, Partial<INPC>>>({});
  public openDoors = new BehaviorSubject<Record<number, boolean>>({});
  public ground = new BehaviorSubject<IGround>({});
  public vfx = new Subject<{
    vfx: VisualEffect;
    vfxX: number;
    vfxY: number;
    vfxRadius: number;
    vfxTimeout: number;
  }>();

  // boxes
  private allBoxes: FloatingBox[] = [];

  // hide the map behind a black screen
  private hideMap = new BehaviorSubject<boolean>(true);
  public hideMapFromView = true;

  // loading text
  private loadPercent = new BehaviorSubject<string>('');
  public loadString = signal<string>('');
  public bannerString = signal<string>('');
  public fadeOut = signal<boolean>(false);

  private game: MapRenderGame;

  public canSeeLowHealthBorder = computed(() => {
    return (
      this.player() &&
      this.player().hp.current <=
        this.player().hp.maximum *
          ((this.optionsService.dyingBorderPercent ?? 25) / 100) &&
      this.optionsService.canShowDyingBorder
    );
  });

  constructor() {
    effect(() => {
      this.allPlayers.next(this.playerHash());
    });

    effect(() => {
      this.allNPCs.next(this.npcHash());
    });

    effect(() => {
      this.openDoors.next(this.doorHash());
    });

    effect(() => {
      this.ground.next(this.groundHash());
    });

    effect(() => {
      this.currentTarget.next(this.target() as ICharacter);
    });

    effect(() => {
      this.gameService.currentMap();
      this.hideMap.next(true);
    });

    GameState.box
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.createBox(data));

    this.socketService.registerComponentCallback(
      'VFX',
      GameServerResponse.GameLog,
      (data) => {
        if (!data.vfx || !data.vfxX || !data.vfxY) return;

        this.vfx.next({
          vfx: data.vfx,
          vfxX: data.vfxX,
          vfxY: data.vfxY,
          vfxRadius: data.vfxRadius ?? 0,
          vfxTimeout: data.vfxTimeout,
        });
      },
    );

    // play game when we get the signal and have a valid map
    combineLatest([
      this.gameService.playGame$,
      toObservable(this.player),
      toObservable(this.gameService.currentMap),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([play, player, mapData]) => {
        if (!play || !player || !mapData) return;
        const areMapsDifferent =
          player?.map &&
          this.currentPlayer.getValue()?.map &&
          player?.map !== this.currentPlayer.getValue()?.map;

        this.map.next(mapData);
        this.currentPlayer.next(player);

        if (!this.game) {
          this.zone.runOutsideAngular(() => {
            this.initMap();
          });
        }

        if (this.game && areMapsDifferent) {
          this.zone.runOutsideAngular(() => {
            this.game.scene.getScene('MapScene')?.scene.restart({
              hideWelcome: true,
              resetVisibilityFlags: true,
            });
          });
        }
      });

    const loadPercent = toSignal(this.loadPercent);
    effect(
      () => {
        const d = loadPercent();
        // if we don't have anything, we set a fadeout boolean and then trigger css animations
        if (!d) {
          this.fadeOut.set(true);

          setTimeout(() => {
            this.loadString.set(d);
            this.fadeOut.set(false);
          }, 5000);

          return;
        }

        // if we do have something, we just set it
        this.loadString.set(d);
        this.fadeOut.set(false);
      },
      { allowSignalWrites: true },
    );

    // have to do it this way so zone doesn't lose it's mind
    this.gameService.bannerMessage$
      .pipe(takeUntilDestroyed())
      .subscribe((d) => {
        // if we do have something, we just set it
        this.bannerString.set(d);
        this.fadeOut.set(false);

        setTimeout(() => {
          this.fadeOut.set(true);

          setTimeout(() => {
            this.fadeOut.set(false);
            this.bannerString.set('');
          }, 2000);
        }, 1000);
      });

    this.hideMap.pipe(takeUntilDestroyed()).subscribe((d) => {
      this.hideMapFromView = d;
    });

    // reset when we get a quit signal
    const quit = toSignal(this.gameService.quitGame$);
    effect(
      () => {
        quit();

        if (this.game) {
          this.game.destroy(true);
          this.game = null;
          this.allBoxes.forEach((b) => b.clearSelf());
        }

        this.map.next(null);
        this.loadPercent.next('');
      },
      { allowSignalWrites: true },
    );
  }

  private createBox(boxData) {
    const box = new FloatingBox(boxData.side, boxData.color, boxData.text);
    box.init(
      document.querySelectorAll('.map')[0],
      () => (this.allBoxes = this.allBoxes.filter((x) => x !== box)),
    );
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
        height: 9 * 64,
      },
      banner: false,
      pixelArt: true,
      pipeline: { OutlinePipeline, GrayPostFXPipeline },
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
        windowChange: this.store
          .select(SettingsState.window)
          .pipe(map((x) => x('map'))),
      },
    );

    // eslint-disable-next-line no-underscore-dangle
    (window as any).__game = this.game;

    this.game.scene.add('PreloadScene', PreloadScene);
    this.game.scene.add('MapScene', MapScene);

    this.game.scene.start('PreloadScene');
  }
}
