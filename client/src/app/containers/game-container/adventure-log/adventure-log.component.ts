import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { select, Store } from '@ngxs/store';

import marked from 'marked';

import { GameServerResponse, MessageType } from '../../../../interfaces';
import { GameState, SetLogMode, SettingsState } from '../../../../stores';
import { WindowComponent } from '../../../_shared/components/window.component';
import { DiscordEmojiPipe } from '../../../_shared/pipes/discord-emoji.pipe';
import { GameService, LogMode } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-adventure-log',
  templateUrl: './adventure-log.component.html',
  styleUrls: ['./adventure-log.component.scss'],
})
export class AdventureLogComponent implements OnInit, AfterViewInit, OnDestroy {
  public inGame = select(GameState.inGame);
  public logMode = select(SettingsState.currentLogMode);

  public readonly chatTabs: LogMode[] = ['All', 'General', 'Combat', 'NPC'];

  @ViewChild(WindowComponent, { read: ElementRef }) public window: ElementRef;

  public messages: Array<{
    messageTypes: MessageType[];
    message: string;
    display?: string;
  }> = [];

  private mutationObserver: MutationObserver;
  private renderer: marked.Renderer;

  private store = inject(Store);
  private optionsService = inject(OptionsService);
  private socketService = inject(SocketService);
  private discordEmojiPipe = inject(DiscordEmojiPipe);
  public gameService = inject(GameService);

  constructor() {
    effect(() => {
      const inGame = this.inGame();
      if (inGame) {
        return;
      }

      this.messages = [];
    });
  }

  ngOnInit() {
    this.initMarkdownRenderer();

    this.socketService.registerComponentCallback(
      'AdventureLog',
      GameServerResponse.GameLog,
      (data) => {
        if (data.messageTypes.includes(MessageType.Chatter)) {
          data.message = `<local:${data.from}> ${data.message}`;
        }

        this.addMessage(data);
      },
    );

    this.socketService.registerComponentCallback(
      'AdventureLog',
      GameServerResponse.Chat,
      (data) => {
        this.addMessage({
          messageTypes: [
            MessageType.Lobby,
            MessageType.Chatter,
            MessageType.PlayerChat,
          ],
          message: `<lobby:${data.from}> ${data.message}`,
        });
      },
    );
  }

  ngAfterViewInit() {
    const outputAreaDOMElement =
      this.window.nativeElement.querySelector('.log-area');

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
    this.socketService.unregisterComponentCallbacks('AdventureLog');
  }

  private initMarkdownRenderer() {
    this.renderer = new marked.Renderer();
    const ident = (t) => t;

    this.renderer.blockquote = ident;
    this.renderer.html = ident;
    this.renderer.heading = ident;
    this.renderer.hr = ident;
    this.renderer.list = ident;
    this.renderer.listitem = ident;
    this.renderer.checkbox = ident;
    this.renderer.paragraph = ident;
    this.renderer.table = ident;
    this.renderer.tablerow = ident;
    this.renderer.tablecell = ident;
    this.renderer.br = ident;
    this.renderer.del = ident;
    this.renderer.image = ident;
    this.renderer.link = (href, title, text) =>
      `<a target="_blank" href="${href}">${text}</a>`;
  }

  public changeTab(newTab: LogMode) {
    this.store.dispatch(new SetLogMode(newTab));
  }

  public isMessageVisible(logMode: LogMode, message): boolean {
    if (logMode === 'All') return true;
    if (logMode === 'NPC') return message.typeHash[MessageType.NPCChatter];

    if (message.typeHash[MessageType.Miscellaneous]) return true;

    if (logMode === 'Combat') return message.typeHash[MessageType.Combat];
    if (logMode === 'General') return !message.typeHash[MessageType.Combat];

    return true;
  }

  private addMessage(message) {
    // create a small hash to quickly look up messages by type
    message.typeHash = {};
    message.messageTypes.forEach((type) => (message.typeHash[type] = true));

    if (
      this.optionsService.suppressOutgoingDoT &&
      message.typeHash[MessageType.OutOvertime]
    ) {
      return;
    }
    if (
      this.optionsService.suppressZeroDamage &&
      (message.message.includes('[0') ||
        message.message.includes('misses!') ||
        message.message.includes('blocked by your'))
    ) {
      return;
    }

    message.display = this.discordEmojiPipe.transform(
      marked(message.message, { renderer: this.renderer }),
      12,
    );

    if (message.source) {
      message.display = `[${message.source}] ${message.display}`;
    }

    if (message.typeHash[MessageType.Banner]) {
      this.gameService.sendUIBannerMessage(message.display);
    }

    if (
      !message.typeHash[MessageType.Banner] ||
      (message.typeHash[MessageType.Banner] &&
        this.optionsService.sendBannerMessagesToChat)
    ) {
      this.messages.push(message);
    }

    if (this.messages.length > 500) this.messages.shift();
  }
}
