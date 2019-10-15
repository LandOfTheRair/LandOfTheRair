import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
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
      name: 'Macros',
      handler: () => {}
    },
    { },
    {
      name: 'Log out',
      handler: () => {
        this.toggleMenu();
        this.socketService.tryDisconnect();
        this.socketService.init();
        this.store.dispatch(new Logout(true));
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
