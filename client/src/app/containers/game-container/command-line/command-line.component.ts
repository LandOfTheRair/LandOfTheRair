import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { select, Store } from '@ngxs/store';
import { debounce } from 'lodash';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ChatMode } from '../../../../interfaces';
import {
  HideWindow,
  LogCurrentCommandInHistory,
  SetActiveWindow,
  SetChatMode,
  SetCurrentCommand,
  SettingsState,
  ShowWindow,
} from '../../../../stores';
import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss'],
})
export class CommandLineComponent implements OnInit, OnDestroy {
  public chatMode = select(SettingsState.chatMode);
  public currentCommandFromSettings = select(SettingsState.currentCommand);

  @ViewChild('commandInput', { read: ElementRef })
  public commandInput: ElementRef;

  public currentCommand = '';

  public placeholderTexts: Record<ChatMode, string> = {
    cmd: 'Enter your command here...',
    say: 'Talk to local players here...',
    party: 'Talk to your party here...',
    guild: 'Talk to your guild here...',
    global: 'Talk to the lobby here...',
  };

  public nextModes: Record<ChatMode, ChatMode> = {
    cmd: 'say',
    say: 'party',
    party: 'guild',
    guild: 'global',
    global: 'cmd',
  };

  command$: Subscription;

  private globalListener: (ev) => void;
  private sendListener: (ev) => void;
  private debouncedUpdate = debounce(
    (str) => this.store.dispatch(new SetCurrentCommand(str)),
    250,
  );

  private curIndex = -1;

  private get isCmdActive() {
    return this.commandInput?.nativeElement === document.activeElement;
  }

  private store = inject(Store);
  private optionsService = inject(OptionsService);
  public gameService = inject(GameService);

  constructor() {
    effect(
      () => {
        const command = this.currentCommandFromSettings();
        this.currentCommand = command;

        if (command) {
          this.store.dispatch(new ShowWindow('commandLine'));
          this.store.dispatch(new SetActiveWindow('commandLine'));
          this.focusInput();
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    this.globalListener = (ev) => {
      // allow tab to change modes
      if (ev.key === 'Tab' && this.isCmdActive) {
        this.store
          .selectOnce((state) => state.settings.chatMode)
          .subscribe((chatMode) => {
            this.updateChatMode(this.nextModes[chatMode]);
          });

        ev.stopPropagation();
        ev.preventDefault();
        return;
      }

      if (
        ev.key === 'Enter' &&
        !this.isCmdActive &&
        this.optionsService.enterToggleCMD
      ) {
        this.store.dispatch(new ShowWindow('commandLine'));
      }

      // allow enter to unfocus chat if there is no command
      if (ev.key === 'Enter' && this.isCmdActive && !this.currentCommand) {
        if (this.optionsService.enterToggleCMD) {
          this.store.dispatch(new HideWindow('commandLine'));
        }

        this.commandInput.nativeElement.blur();
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      // block text entry here if there is a different text input active
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (ev.key === 'Enter') {
        this.store.dispatch(new SetActiveWindow('commandLine'));
        this.focusInput();
      }
    };

    this.sendListener = (ev) => {
      if (environment.production) {
        ev.preventDefault();
      }
      if (!this.optionsService.rightClickSend) return;
      this.sendCommand(ev);
    };

    document.addEventListener('keydown', this.globalListener);
    document.addEventListener('contextmenu', this.sendListener);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.globalListener);
    document.removeEventListener('contextmenu', this.sendListener);
  }

  updateChatMode(newMode) {
    this.store.dispatch(new SetChatMode(newMode));
  }

  updateCommand(newCommand: string) {
    this.currentCommand = newCommand;
    this.debouncedUpdate(newCommand);
  }

  sendCommand(ev) {
    let currentCommand = (this.currentCommand || '').trim();
    if (!currentCommand) return;

    ev.preventDefault();
    ev.stopPropagation();

    this.store
      .selectOnce((state) => state.settings.chatMode)
      .subscribe((chatMode: ChatMode) => {
        const reset = () => {
          this.debouncedUpdate.cancel();
          this.updateCommand('');
          this.store.dispatch(new LogCurrentCommandInHistory(currentCommand));
        };

        const doCommand = (commandToDo: string) => {
          this.curIndex = -1;

          this.gameService.sendCommandString(commandToDo.trim());
          reset();

          (document.activeElement as HTMLElement).blur();

          if (this.optionsService.enterToggleCMD) {
            this.store.dispatch(new HideWindow('commandLine'));
          }
        };

        const shouldBypassOthers = currentCommand.startsWith('#');

        if (!shouldBypassOthers && chatMode === 'say') {
          this.gameService.sendCommandString(`!say ${currentCommand}`);
          reset();
          return;
        }

        if (!shouldBypassOthers && chatMode === 'party') {
          this.gameService.sendCommandString(`!partysay ${currentCommand}`);
          reset();
          return;
        }

        if (!shouldBypassOthers && chatMode === 'guild') {
          this.gameService.sendCommandString(`!guildsay ${currentCommand}`);
          reset();
          return;
        }

        if (!shouldBypassOthers && chatMode === 'global') {
          this.gameService.sendCommandString(`!lobbysay ${currentCommand}`);
          reset();
          return;
        }

        if (shouldBypassOthers) {
          currentCommand = (currentCommand || '').substring(1);
        }

        if (currentCommand === '.') {
          this.store
            .selectOnce((state) => state.settings.commandHistory)
            .subscribe((history) => {
              const command = history[0];
              if (!command) return;

              this.debouncedUpdate.cancel();
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

    this.store
      .selectOnce((state) => state.settings.commandHistory)
      .subscribe((history) => {
        const newIndex = diff + this.curIndex;
        if (newIndex <= -2 || newIndex >= history.length) return;

        this.curIndex += diff;

        let curCommand = history[newIndex];
        if (this.curIndex <= -1 || !history[newIndex]) {
          curCommand = '';
        }

        this.debouncedUpdate.cancel();
        this.updateCommand(curCommand);
      });
  }

  private focusInput() {
    setTimeout(() => {
      if (!this.commandInput) return;

      this.commandInput.nativeElement.focus();

      // this moves the cursor to the end of the input
      this.commandInput.nativeElement.value =
        this.commandInput.nativeElement.value ?? '';
    }, 0);
  }
}
