import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { ChatMode, GameServerEvent } from '../../../../models';
import { HideWindow, SetChatMode, SetCurrentCommand, ShowWindow } from '../../../../stores';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})
export class CommandLineComponent implements OnInit, OnDestroy {

  @ViewChild('commandInput', { static: false, read: ElementRef }) public commandInput: ElementRef;

  // TODO: ., history, #, enter from anywhere, etc.

  public currentCommand = '';

  public placeholderTexts: { [key in ChatMode]: string } = {
    cmd: 'Enter your command here...',
    say: 'Talk to local players here...',
    party: 'Talk to your party here...',
    global: 'Talk to the lobby here...'
  };

  public nextModes: { [key in ChatMode]: ChatMode } = {
    cmd: 'say',
    say: 'party',
    party: 'global',
    global: 'cmd'
  };

  private command$: Subscription;
  private globalListener: (ev) => void;
  private sendListener: (ev) => void;

  // private curIndex = -1;

  private get isCmdActive() {
    return this.commandInput.nativeElement === document.activeElement;
  }

  constructor(
    private store: Store,
    private socketService: SocketService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.command$ = this.gameService.currentCommand$.subscribe(command => {
      this.currentCommand = command;
      this.store.dispatch(new ShowWindow('commandLine'));
      this.focusInput();
    });

    this.globalListener = (ev) => {

      // allow tab to change modes
      if (ev.key === 'Tab' && this.isCmdActive) {
        this.store.selectOnce(state => state.settings.chatMode)
          .subscribe(chatMode => {
            this.updateChatMode(this.nextModes[chatMode]);
          });

        ev.stopPropagation();
        ev.preventDefault();
        return;
      }

      // allow enter to unfocus chat if there is no command
      if (ev.key === 'Enter' && this.isCmdActive && !this.currentCommand) {
        this.store.dispatch(new HideWindow('commandLine'));
        this.commandInput.nativeElement.blur();
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      // block text entry here if there is a different text input active
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      // TODO: check if there is a macro that matches the key we input, if so, swallow

      // if we're not hitting enter, we don't care about this
      if (ev.key !== 'Enter') return;

      this.store.dispatch(new ShowWindow('commandLine'));

      this.focusInput();
    };

    this.sendListener = (ev) => {

    };

    document.addEventListener('keydown', this.globalListener);
    document.addEventListener('contextmenu', this.sendListener);
  }

  ngOnDestroy() {
    if (this.command$) this.command$.unsubscribe();
    document.removeEventListener('keydown', this.globalListener);
    document.removeEventListener('contextmenu', this.sendListener);
  }

  updateChatMode(newMode) {
    this.store.dispatch(new SetChatMode(newMode));
  }

  updateCommand(newCommand) {
    this.store.dispatch(new SetCurrentCommand(newCommand));
  }

  sendCommand(ev) {
    if (!this.currentCommand || !this.currentCommand.trim()) return;
    ev.preventDefault();
    ev.stopPropagation();

    this.doCommand(this.currentCommand.trim());

    this.store.dispatch(new SetCurrentCommand(''));
  }

  private focusInput() {
    setTimeout(() => {
      this.commandInput.nativeElement.focus();
    }, 0);
  }

  private doCommand(cmdString: string) {
    const [command, ...args] = cmdString.split(' ');
    this.socketService.emit(GameServerEvent.DoCommand, { command, args: args.join(' ') });
  }

}
