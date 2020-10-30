import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';

import { Subscription } from 'rxjs';
import { GameServerResponse, MessageType } from '../../../../interfaces';
import { SetLogMode } from '../../../../stores';
import { WindowComponent } from '../../../_shared/components/window.component';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-adventure-log',
  templateUrl: './adventure-log.component.html',
  styleUrls: ['./adventure-log.component.scss']
})
export class AdventureLogComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(WindowComponent, { static: false, read: ElementRef }) public window: ElementRef;

  public messages: Array<{ messageTypes: MessageType[], message: string }> = [];

  private mutationObserver: MutationObserver;

  inGame$: Subscription;

  constructor(
    private store: Store,
    private socketService: SocketService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.inGame$ = this.gameService.inGame$.subscribe(inGame => {
      if (inGame) return;

      this.messages = [];
    });

    this.socketService.registerComponentCallback(this.constructor.name, GameServerResponse.GameLog, (data) => {
      if (data.messageTypes.includes(MessageType.Chatter)) data.message = `<local:${data.from}> ${data.message}`;
      this.addMessage(data);
    });

    this.socketService.registerComponentCallback(this.constructor.name, GameServerResponse.Chat, (data) => {
      this.addMessage({
        messageTypes: [MessageType.Lobby, MessageType.Chatter],
        message: `<lobby:${data.from}> ${data.message}`
      });
    });
  }

  ngAfterViewInit() {
    const outputAreaDOMElement = this.window.nativeElement.querySelector('.log-area');

    const scrollToBottom = () => {
      outputAreaDOMElement.scrollTop = outputAreaDOMElement.scrollHeight;
    };

    this.mutationObserver = new MutationObserver(() => {
      scrollToBottom();
    });

    this.mutationObserver.observe(outputAreaDOMElement, {
        childList: true
    });

    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks(this.constructor.name);
  }

  public changeTab(newTab: 'General'|'Combat') {
    this.store.dispatch(new SetLogMode(newTab));
  }

  public isMessageVisible(logMode: 'General'|'Combat', message): boolean {
    if (message.typeHash[MessageType.Miscellaneous]) return true;

    if (logMode === 'Combat') return message.typeHash[MessageType.Combat];
    if (logMode === 'General') return !message.typeHash[MessageType.Combat];

    return true;
  }

  private addMessage(message) {

    // create a small hash to quickly look up messages by type
    message.typeHash = {};
    message.messageTypes.forEach(type => message.typeHash[type] = true);

    this.messages.push(message);

    if (this.messages.length > 500) this.messages.shift();
  }

}
