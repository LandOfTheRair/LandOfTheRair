import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { select, Store } from '@ngxs/store';
import { DateTime } from 'luxon';
import { Observable, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { GameServerEvent } from '../../interfaces';
import {
  AccountState,
  GameState,
  Logout,
  ResetWindowPositions,
  ShowWindow,
} from '../../stores';
import { AnnouncementService } from '../services/announcement.service';
import { APIService } from '../services/api.service';

import { toObservable } from '@angular/core/rxjs-interop';
import { AssetService } from '../services/asset.service';
import { GameService } from '../services/game.service';
import { ModalService } from '../services/modal.service';
import { SocketService } from '../services/socket.service';

interface MenuItem {
  name: string;
  handler: () => void;
  children?: MenuItem[];

  icon?: string;
  borderTop?: boolean;
  visibleIf?: Observable<boolean>;

  disabled?: boolean;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  private store = inject(Store);
  private announcementService = inject(AnnouncementService);
  private modalService = inject(ModalService);
  private api = inject(APIService);
  public socketService = inject(SocketService);
  public gameService = inject(GameService);
  public assetService = inject(AssetService);

  public inGame = select(GameState.inGame);
  public loggedIn = select(AccountState.loggedIn);

  private serverAssetHash: string;

  public get serverMismatchWarning(): boolean {
    return !!this.api.overrideAPIURL;
  }

  public get assetMismatchWarning(): boolean {
    if (this.api.overrideAPIURL) return false;
    if (!this.serverAssetHash) return false;
    return this.serverAssetHash !== this.assetService.clientAssetHash;
  }

  public get minimumResolutionWarning(): boolean {
    return window.innerHeight < 900 || window.innerWidth < 1280;
  }

  public isMenuVisible: boolean;
  public menuItems: MenuItem[] = [
    {
      name: 'Game',
      handler: () => {},
      children: [
        {
          name: 'My Account',
          icon: 'account_circle',
          handler: () => this.modalService.showAccount(),
        },
        {
          name: 'Current Events',
          icon: 'event',
          handler: () => this.modalService.showCurrentEvents(),
        },
        {
          name: 'Manage Silver',
          icon: 'account_balance',
          visibleIf: toObservable(this.inGame).pipe(map((x) => !x)),
          handler: () => this.modalService.showManageSilver(),
        },
        {
          name: 'Leaderboard',
          icon: 'score',
          handler: () => window.open('https://global.rair.land', '_blank'),
          borderTop: true,
        },
        {
          name: 'Blog',
          icon: 'rss_feed',
          visibleIf: of(!!this.announcementService.latestAnnouncement),
          handler: () =>
            window.open(
              this.announcementService.latestAnnouncement.link,
              '_blank',
            ),
        },
        {
          name: 'Help',
          icon: 'help_outline',
          handler: () => window.open('https://rair.land/docs/home', '_blank'),
        },
        {
          name: 'Reload UI',
          icon: 'refresh',
          visibleIf: of(navigator.userAgent.includes('Electron')),
          handler: () => window.location.reload(),
        },
        {
          name: 'Download',
          icon: 'download',
          visibleIf: of(!navigator.userAgent.includes('Electron')),
          handler: () => window.open('https://rair.land/download', '_blank'),
        },
        {
          name: 'About',
          icon: 'info',
          handler: () => this.modalService.showAbout(),
          borderTop: true,
        },
      ],
    },
    {
      name: 'Windows',
      handler: () => {},
      children: [
        {
          name: 'Journal',
          handler: () => this.store.dispatch(new ShowWindow('journal')),
        },
        {
          name: 'Command Line',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('commandLine')),
        },
        {
          name: 'Character',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('equipmentMain')),
        },
        {
          name: 'Belt',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('inventoryBelt')),
        },
        {
          name: 'Sack',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('inventorySack')),
        },
        {
          name: 'Ground',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('ground')),
        },
        {
          name: 'Party',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('party')),
        },
        {
          name: 'Quests',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('quests')),
        },
        {
          name: 'Talents',
          visibleIf: toObservable(this.inGame),
          handler: () => this.store.dispatch(new ShowWindow('traits')),
        },
        {
          name: 'Reset Window Positions',
          borderTop: true,
          handler: () => {
            this.modalService
              .confirm(
                'Reset Window Positions',
                'Are you sure you want to reset all your window positions?',
              )
              .subscribe((res) => {
                if (!res) return;

                this.store.dispatch(new ResetWindowPositions());
              });
          },
        },
      ],
    },
    {
      name: 'Macros',
      visibleIf: toObservable(this.inGame),
      handler: () => this.modalService.showMacros(),
    },
    {
      name: 'Options',
      handler: () => this.modalService.showOptions(),
    },
    {
      name: 'Errors',
      handler: () => this.modalService.showErrorLog(),
    },
    {
      name: 'Exit To Lobby',
      visibleIf: toObservable(this.inGame),
      handler: () => {
        this.modalService
          .confirm('Exit Game', 'Are you sure you want to exit to lobby?')
          .subscribe((res) => {
            if (!res) return;

            this.socketService.emit(GameServerEvent.QuitGame);
          });
      },
    },
    {
      name: 'Log Out',
      borderTop: true,
      handler: () => {
        this.modalService
          .confirm(
            'Log Out',
            'Are you sure you want to log out of Land of the Rair?',
          )
          .subscribe((res) => {
            if (!res) return;

            this.socketService.emit(GameServerEvent.QuitGame);

            setTimeout(() => {
              this.socketService.emit(GameServerEvent.Logout);
            }, 50);

            setTimeout(() => {
              this.store.dispatch(new Logout(true));
            }, 75);

            setTimeout(() => {
              this.socketService.tryDisconnect();
              this.socketService.init();
            }, 100);
          });
      },
    },
  ];

  // show the warning or not, default yes, unsaved
  public showResolutionWarning = true;
  public showMismatchWarning = true;

  // so many props, only one output
  public resetTimestamp: number;
  public nowTimestamp: number;
  public timestampDisplay: string;

  constructor() {
    effect(() => {
      this.serverAssetHash = this.assetService.assetHash();
    });
  }

  ngOnInit() {
    this.watchResetTime();
  }

  private watchResetTime() {
    const setResetTimestamp = () => {
      let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
      if (+theoreticalResetTime < DateTime.fromObject({ zone: 'utc' })) {
        theoreticalResetTime = theoreticalResetTime.plus({ days: 1 });
      }

      this.resetTimestamp = +theoreticalResetTime;
    };

    const formatTimestring = () => {
      const diff = (this.resetTimestamp - this.nowTimestamp) / 1000;
      const hours = Math.floor(diff / 60 / 60) % 60;
      const minutes = Math.floor(diff / 60) % 60;

      this.timestampDisplay = `${hours > 0 ? hours + 'h' : ''} ${minutes}m`;
    };

    setResetTimestamp();
    formatTimestring();

    timer(0, 60000).subscribe(() => {
      this.nowTimestamp = +DateTime.fromObject({ zone: 'utc' });
      if (this.nowTimestamp > this.resetTimestamp) setResetTimestamp();
      formatTimestring();
    });
  }

  public hideResolution() {
    this.showResolutionWarning = false;
  }

  public hideMismatch() {
    this.showMismatchWarning = false;
  }
}
