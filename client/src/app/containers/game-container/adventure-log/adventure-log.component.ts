import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameServerResponse } from '../../../../models';
import { WindowComponent } from '../../../_shared/components/window.component';
import { SocketService } from '../../../socket.service';

@Component({
  selector: 'app-adventure-log',
  templateUrl: './adventure-log.component.html',
  styleUrls: ['./adventure-log.component.scss']
})
export class AdventureLogComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(WindowComponent, { static: false, read: ElementRef }) public window: ElementRef;

  public messages: Array<{ messageTypes: string[], message: string }> = [];

  private mutationObserver: MutationObserver;

  constructor(
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.socketService.registerComponentCallback(this.constructor.name, GameServerResponse.GameLog, (data) => {
      this.addMessage(data);
    });

    this.socketService.registerComponentCallback(this.constructor.name, GameServerResponse.Chat, (data) => {
      this.addMessage({
        messageTypes: ['lobby', 'chat'],
        message: `[${data.from}] ${data.message}`
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

  private addMessage(message) {
    this.messages.push(message);
  }

}
