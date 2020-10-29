import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { GameService } from './game.service';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

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

}
