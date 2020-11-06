import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { GameService } from './game.service';
import { SocketService } from './socket.service';

import { IAccount, isSubscribed } from '../interfaces';
import { AccountState } from '../stores';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @Select(AccountState.account) account$: Observable<IAccount>;

  constructor(
    public socketService: SocketService,
    public gameService: GameService
  ) {}

  ngOnInit() {
    if (environment.production) {
      console.log(
        '%cStop!',
        'color:red;font-family:system-ui;font-size:4rem;-webkit-text-stroke: 1px black;font-weight:bold'
      );

      console.log('This is a browser feature intended for developers.');
      console.log('Do not paste or run any code here unless you really know what you\'re doing!');
      console.log('Doing so could give your account information to someone else, destroy your characters, or worse.');
    }
  }

  public isSubscribed(account: IAccount): boolean {
    return isSubscribed(account);
  }

}
