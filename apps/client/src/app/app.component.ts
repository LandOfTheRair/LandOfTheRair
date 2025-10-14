import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { select } from '@ngxs/store';

import { IAccount } from '@lotr/interfaces';
import { isSubscribed } from '@lotr/shared';
import { environment } from '../environments/environment';
import { AccountState } from '../stores';
import { GameService } from './services/game.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public account = select(AccountState.account);
  public loggedIn = select(AccountState.loggedIn);

  public socketService = inject(SocketService);
  public gameService = inject(GameService);

  ngOnInit() {
    if (environment.production) {
      console.warn(
        '%cStop!',
        'color:red;font-family:system-ui;font-size:4rem;-webkit-text-stroke: 1px black;font-weight:bold',
      );

      console.warn('This is a browser feature intended for developers.');
      console.warn(
        "Do not paste or run any code here unless you really know what you're doing!",
      );
      console.warn(
        'Doing so could give your account information to someone else, destroy your characters, or worse.',
      );
    }
  }

  public isInElectron(): boolean {
    return navigator.userAgent.includes('Electron');
  }

  public isSubscribed(account: IAccount): boolean {
    return isSubscribed(account);
  }
}
