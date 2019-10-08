import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LobbyState, AddMessage, AddUser, RemoveUser } from '../../../../stores';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IChatUser, IChatMessage, GameServerResponse, GameServerEvent } from '../../../../models';
import { SocketService } from '../../../socket.service';
import { WindowComponent } from '../../../_shared/components/window.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(WindowComponent, { static: false, read: ElementRef }) public window: ElementRef;

  @Select(LobbyState.motd) public motd$: Observable<string>;
  @Select(LobbyState.users) public users$: Observable<IChatUser[]>;
  @Select(LobbyState.messages) public messages$: Observable<IChatMessage[]>;

  public currentMessage: string;

  private mutationObserver: MutationObserver;

  constructor(
    private store: Store,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.Chat,
      (data) => this.recieveMessage(data)
    );

    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.UserJoin,
      (data) => this.userJoin(data)
    );

    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.UserLeave,
      (data) => this.userLeave(data)
    );
  }

  ngAfterViewInit() {
    const outputAreaDOMElement = this.window.nativeElement.querySelector('.output-area');

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

  sendMessage() {
    if (!this.currentMessage || !this.currentMessage.trim()) return;

    this.socketService.emit(GameServerEvent.Chat, { content: this.currentMessage.trim() });
    this.currentMessage = '';
  }

  private recieveMessage(data) {
    this.store.dispatch(new AddMessage(data.user, data.content, data.unixTimestamp));
  }

  private userJoin(data) {
    this.store.dispatch(new AddUser(data));
  }

  private userLeave(data) {
    this.store.dispatch(new RemoveUser(data.username));
  }

}
