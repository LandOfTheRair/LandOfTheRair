import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameServerEvent, IChatMessage, IChatUser } from '../../../../interfaces';
import { LobbyState } from '../../../../stores';
import { SocketService } from '../../../services/socket.service';
import { WindowComponent } from '../../../_shared/components/window.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(WindowComponent, { read: ElementRef }) public window: ElementRef;

  @Select(LobbyState.motd) public motd$: Observable<string>;
  @Select(LobbyState.users) public users$: Observable<IChatUser[]>;
  @Select(LobbyState.messages) public messages$: Observable<IChatMessage[]>;

  public currentMessage: string;

  private mutationObserver: MutationObserver;

  constructor(
    private socketService: SocketService
  ) { }

  ngOnInit() {
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
  }

  sendMessage() {
    if (!this.currentMessage || !this.currentMessage.trim()) return;

    this.socketService.emit(GameServerEvent.Chat, { content: this.currentMessage.trim() });
    this.currentMessage = '';
  }

}
