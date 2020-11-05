import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
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
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
  }

}
