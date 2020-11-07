import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { DateTime } from 'luxon';
import { timer } from 'rxjs';

import { GameServerEvent } from '../../interfaces';
import { Logout } from '../../stores';
import { AssetService } from '../asset.service';
import { GameService } from '../game.service';
import { SocketService } from '../socket.service';

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
      handler: () => {}
    },
    {
      name: 'Windows',
      handler: () => {}
    },
    {
      name: 'Options',
      handler: () => {}
    },
    {
      name: 'Macros',
      visibleIf: this.gameService.inGame$,
      handler: () => {}
    },
    { },
    {
      name: 'Quit',
      visibleIf: this.gameService.inGame$,
      handler: () => {
        this.socketService.emit(GameServerEvent.QuitGame);
        this.toggleMenu();
      }
    },
    {
      name: 'Log Out',
      handler: () => {
        this.toggleMenu();
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
      }
    }
  ];

  // show the message or not, default no, unsaved
  public showDailyResetMessage: boolean;

  // so many props, only one output
  public resetTimestamp: number;
  public nowTimestamp: number;
  public timestampDisplay: string;

  constructor(
    private store: Store,
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

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
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

}
