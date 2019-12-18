import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { ChatMode, GameServerEvent } from '../../../../models';
import { HideWindow, LogCurrentCommandInHistory, SetChatMode, SetCurrentCommand, ShowWindow } from '../../../../stores';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})
export class CommandLineComponent implements OnInit, OnDestroy {

  @ViewChild('commandInput', { static: false, read: ElementRef }) public commandInput: ElementRef;

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

  private curIndex = -1;

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

    // TODO: right click send option
    this.sendListener = (ev) => {
      /*
      if(environment.production) {
        ev.preventDefault();
      }
      if(!this.rightClickSend) return;
      this.sendCommand();
      */
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

    let currentCommand = (this.currentCommand || '').trim();
    if (!currentCommand) return;

    ev.preventDefault();
    ev.stopPropagation();

    this.store.selectOnce(state => state.settings.chatMode)
      .subscribe((chatMode: ChatMode) => {

        const reset = () => {
          this.store.dispatch(new LogCurrentCommandInHistory());
          this.store.dispatch(new SetCurrentCommand(''));
        };

        const doCommand = (commandToDo: string) => {
          this.curIndex = -1;

          this.doCommand(commandToDo.trim());
          reset();

          (document.activeElement as HTMLElement).blur();
        };

        const shouldBypassOthers = currentCommand.startsWith('#');

        if (!shouldBypassOthers && chatMode === 'say') {
          this.doCommand(`!say ${currentCommand}`);
          reset();
          return;
        }

        if (!shouldBypassOthers && chatMode === 'party') {
          this.doCommand(`!partysay ${currentCommand}`);
          reset();
          return;
        }

        if (!shouldBypassOthers && chatMode === 'global') {
          this.doCommand(`!lobbysay ${currentCommand}`);
          reset();
          return;
        }

        if (shouldBypassOthers) {
          currentCommand = currentCommand.substring(1);
        }

        if (currentCommand === '.') {
          this.store.selectOnce(state => state.settings.commandHistory)
            .subscribe(history => {
              const command = history[0];
              if (!command) return;

              this.updateCommand(command);
              doCommand(command);
            });

          return;
        }

        doCommand(currentCommand);
      });
  }

  searchCommandHistory(ev, diff: number) {
    ev.preventDefault();

    this.store.selectOnce(state => state.settings.commandHistory)
      .subscribe(history => {
        const newIndex = diff + this.curIndex;
        if (newIndex <= -2 || newIndex >= history.length) return;

        this.curIndex += diff;

        let curCommand = history[newIndex];
        if (this.curIndex <= -1 || !history[newIndex]) {
          curCommand = '';
        }

        this.store.dispatch(new SetCurrentCommand(curCommand));
      });
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
