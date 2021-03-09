import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { DateTime } from 'luxon';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { GameServerEvent } from '../../interfaces';
import { Logout, ResetWindowPositions, ShowWindow } from '../../stores';
import { AnnouncementService } from '../services/announcement.service';

import { AssetService } from '../services/asset.service';
import { GameService } from '../services/game.service';
import { ModalService } from '../services/modal.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  private serverAssetHash: string;

  public get assetMismatchWarning(): boolean {
    if (!this.serverAssetHash) return false;
    return this.serverAssetHash !== this.assetService.clientAssetHash;
  }

  public get minimumResolutionWarning(): boolean {
    return (window.innerHeight < 900 || window.innerWidth < 1280);
  }

  public isMenuVisible: boolean;
  public menuItems = [
    {
      name: 'Game',
      handler: () => {},
      children: [
        {
          name: 'My Account',
          icon: 'account_circle',
          handler: () => this.modalService.showAccount()
        },
        {
          name: 'Current Events',
          icon: 'event',
          handler: () => this.modalService.showCurrentEvents()
        },
        {
          name: 'Manage Silver',
          icon: 'account_balance',
          visibleIf: this.gameService.inGame$.pipe(map(x => !x)),
          handler: () => this.modalService.showManageSilver()
        },
        {
          name: 'Leaderboard',
          icon: 'open_in_new',
          handler: () => window.open('https://global.rair.land', '_blank'),
          borderTop: true,
        },
        {
          name: 'Blog',
          icon: 'open_in_new',
          visibleIf: this.announcementService.latestAnnouncement,
          handler: () => window.open(this.announcementService.latestAnnouncement.link, '_blank'),
        },
        {
          name: 'Help',
          icon: 'open_in_new',
          handler: () => window.open('https://rair.land/docs/home', '_blank'),
        },
        {
          name: 'About',
          icon: 'info',
          handler: () => this.modalService.showAbout(),
          borderTop: true
        }
      ]
    },
    {
      name: 'Windows',
      handler: () => {},
      children: [
        {
          name: 'Journal',
          handler: () => this.store.dispatch(new ShowWindow('journal'))
        },
        {
          name: 'Command Line',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('commandLine'))
        },
        {
          name: 'Character',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('equipmentMain'))
        },
        {
          name: 'Belt',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('inventoryBelt'))
        },
        {
          name: 'Sack',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('inventorySack'))
        },
        {
          name: 'Ground',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('ground'))
        },
        {
          name: 'Party',
          disabled: true,
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('party'))
        },
        {
          name: 'Quests',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('quests'))
        },
        {
          name: 'Rune Codex',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('runecodex'))
        },
        {
          name: 'Traits',
          visibleIf: this.gameService.inGame$,
          handler: () => this.store.dispatch(new ShowWindow('traits'))
        },
        {
          name: 'Reset Window Positions',
          borderTop: true,
          handler: () => {
            this.modalService.confirm('Reset Window Positions', 'Are you sure you want to reset all your window positions?')
              .subscribe(res => {
                if (!res) return;

                this.store.dispatch(new ResetWindowPositions());
              });
          }
        },
      ]
    },
    {
      name: 'Macros',
      visibleIf: this.gameService.inGame$,
      handler: () => this.modalService.showMacros()
    },
    {
      name: 'Options',
      handler: () => this.modalService.showOptions()
    },
    {
      name: 'Exit To Lobby',
      visibleIf: this.gameService.inGame$,
      handler: () => {
        this.modalService.confirm('Exit Game', 'Are you sure you want to exit to lobby?')
          .subscribe(res => {
            if (!res) return;

            this.socketService.emit(GameServerEvent.QuitGame);
          });
      }
    },
    {
      name: 'Log Out',
      borderTop: true,
      handler: () => {
        this.modalService.confirm('Log Out', 'Are you sure you want to log out of Land of the Rair?')
          .subscribe(res => {
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
      }
    }
  ];

  // show the warning or not, default yes, unsaved
  public showResolutionWarning = true;

  // show the message or not, default no, unsaved
  public showDailyResetMessage: boolean;

  // so many props, only one output
  public resetTimestamp: number;
  public nowTimestamp: number;
  public timestampDisplay: string;

  constructor(
    private store: Store,
    private announcementService: AnnouncementService,
    private modalService: ModalService,
    public socketService: SocketService,
    public gameService: GameService,
    public assetService: AssetService
  ) { }

  ngOnInit() {
    this.assetService.assetHash$.subscribe(hash => {
      this.serverAssetHash = hash;
    });

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
      const hours = Math.floor((diff / 60) / 60) % 60;
      const minutes = Math.floor((diff / 60)) % 60;

      this.timestampDisplay = `${hours > 0 ? hours + 'h' : ''} ${minutes}m`;
    };

    setResetTimestamp();
    formatTimestring();

    timer(0, 60000)
      .subscribe(() => {
        this.nowTimestamp = +DateTime.fromObject({ zone: 'utc' });
        if (this.nowTimestamp > this.resetTimestamp) setResetTimestamp();
        formatTimestring();
      });
  }

  public hideResolution() {
    this.showResolutionWarning = false;
  }

}
