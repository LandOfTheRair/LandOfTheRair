import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { Alignment, Allegiance, ChatMode, GameServerEvent, Hostility, IAccount, ICharacter,
  ICharacterCreateInfo, IDialogChatAction, IMapData, INPC, IPlayer, isHostileTo } from '../interfaces';
import { AccountState, GameState, LobbyState, SettingsState } from '../stores';

import { ModalService } from './modal.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private playGame: Subject<boolean> = new Subject();
  public get playGame$() {
    return this.playGame.asObservable();
  }

  private quitGame: Subject<void> = new Subject();
  public get quitGame$() {
    return this.quitGame.asObservable();
  }

  @Select(GameState.inGame) inGame$: Observable<boolean>;
  @Select(GameState.player) currentPlayer$: Observable<IPlayer>;
  @Select(GameState.map) currentMap$: Observable<IMapData>;

  @Select(AccountState.loggedIn) loggedIn$: Observable<boolean>;
  @Select(AccountState.account) account$: Observable<IAccount>;

  @Select(LobbyState.charCreateData) charCreateData$: Observable<ICharacterCreateInfo>;

  @Select(SettingsState.accounts) accounts$: Observable<IAccount[]>;
  @Select(SettingsState.charSlot) charSlot$: Observable<{ slot: number }>;
  @Select(SettingsState.chatMode) chatMode$: Observable<ChatMode>;
  @Select(SettingsState.currentCommand) currentCommand$: Observable<string>;
  @Select(SettingsState.currentLogMode) logMode$: Observable<string>;

  constructor(
    private socketService: SocketService,
    private modalService: ModalService
  ) {}

  init() {
    this.inGame$.subscribe(val => {
      if (val) {
        this.playGame.next(true);
        return;
      }

      this.playGame.next(false);
      this.quitGame.next();
    });
  }

  public sendCommandString(cmdString: string, target?: string) {
    if (cmdString.startsWith('#')) cmdString = cmdString.substring(1);

    cmdString.split(';').forEach(cmd => {
      cmd = cmd.trim();

      let command = '';
      let args = '';

      if (cmd.includes(',')) {
        command = '!privatesay';
        args = cmd;
      } else {
        [command, args] = this.parseCommand(cmd);
      }

      if (target) {
        args = `${args} ${target}`;
      }

      this.sendAction(GameServerEvent.DoCommand, { command, args });
    });
  }

  public sendAction(action: GameServerEvent, args: any) {
    this.socketService.emit(action, args);
  }

  private parseCommand(cmd: string) {
    const arr = cmd.split(' ');
    const multiPrefixes = ['party', 'look', 'show', 'cast', 'stance', 'powerword', 'art'];

    let argsIndex = 1;

    let command = arr[0];

    if (multiPrefixes.includes(command)) {
      command = `${arr[0]} ${arr[1]}`;
      argsIndex = 2;
    }

    // factor in the space because otherwise indexOf can do funky things.
    const args = arr.length > argsIndex ? cmd.substring(cmd.indexOf(' ' + arr[argsIndex])).trim() : '';

    return [command, args];
  }

  // get the direction from a character to another one
  public directionTo(from: ICharacter, to: ICharacter) {
    if (!to || !from) return '';

    const diffX = to.x - from.x;
    const diffY = to.y - from.y;

    if (diffX < 0 && diffY > 0) return '↙';
    if (diffX > 0 && diffY < 0) return '↗';
    if (diffX > 0 && diffY > 0) return '↘';
    if (diffX < 0 && diffY < 0) return '↖';

    if (diffX > 0)              return '→';
    if (diffY > 0)              return '↓';

    if (diffX < 0)              return '←';
    if (diffY < 0)              return '↑';

    return '✧';
  }

  // check the hostility level between two characters
  // any changes here _might_ need to be made to server/checkTargetForHostility
  public hostilityLevelFor(origin: ICharacter, compare: ICharacter): 'hostile'|'neutral'|'friendly' {
    if (!origin) return 'neutral';

    if (origin.allegiance === Allegiance.GM) return 'neutral';
    if (compare.allegiance === Allegiance.NaturalResource) return 'neutral';

    if ((origin as IPlayer).partyName && (origin as IPlayer).partyName === (compare as IPlayer).partyName) return 'neutral';

    if (compare.agro[origin.uuid] || origin.agro[compare.uuid]) return 'hostile';

    // TODO: disguise
    // if(me.hasEffect('Disguise') && me.getTotalStat('cha') > compare.getTotalStat('wil')) return 'neutral';

    const hostility = (compare as INPC).hostility;

    if (!hostility) return 'neutral';

    if (hostility === Hostility.Never) return 'friendly';

    if (hostility === Hostility.Faction) {
      if (isHostileTo(origin, compare.allegiance)
      || isHostileTo(compare, origin.allegiance)) return 'hostile';
    }

    if (origin.allegiance === compare.allegiance) return 'neutral';

    if (hostility === Hostility.Always) return 'hostile';

    if (origin.alignment === Alignment.Evil && compare.alignment === Alignment.Good) return 'hostile';

    return 'neutral';
  }

  public showNPCDialog(dialogInfo: IDialogChatAction) {
    const res = this.modalService.npcDialog(dialogInfo);
    if (!res) return;

    res.subscribe(result => {
      if (result && result !== 'noop') {
        this.sendCommandString(`#${dialogInfo.displayNPCUUID || dialogInfo.displayNPCName}, ${result}`);
      }
    });
  }
}
