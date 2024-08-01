import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { select } from '@ngxs/store';
import { GameServerEvent, GameServerResponse } from '../../../../interfaces';
import { LobbyState } from '../../../../stores';
import { WindowComponent } from '../../../_shared/components/window.component';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(WindowComponent, { read: ElementRef }) public window: ElementRef;

  public motd = select(LobbyState.motd);
  public users = select(LobbyState.users);
  public messages = select(LobbyState.messages);

  public discordCount = 0;
  public currentMessage: string;

  private mutationObserver: MutationObserver;

  private socketService = inject(SocketService);

  ngOnInit() {
    this.socketService.registerComponentCallback(
      'Lobby',
      GameServerResponse.UserCountUpdate,
      (data) => (this.discordCount = data.count),
    );
  }

  ngAfterViewInit() {
    const outputAreaDOMElement =
      this.window.nativeElement.querySelector('.output-area');

    const scrollToBottom = () => {
      outputAreaDOMElement.scrollTop = outputAreaDOMElement.scrollHeight;
    };

    this.mutationObserver = new MutationObserver(() => {
      scrollToBottom();
    });

    this.mutationObserver.observe(outputAreaDOMElement, {
      childList: true,
    });

    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks('Lobby');
  }

  sendMessage() {
    if (!this.currentMessage || !this.currentMessage.trim()) return;

    this.socketService.emit(GameServerEvent.Chat, {
      content: this.currentMessage.trim(),
    });
    this.currentMessage = '';
  }
}
