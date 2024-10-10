import { effect, inject, Injectable } from '@angular/core';
import { select } from '@ngxs/store';
import { sample, sortBy, startCase } from 'lodash';
import { Subject } from 'rxjs';

import {
  directionFromOffset,
  directionToSymbol,
  distanceFrom,
  GameServerEvent,
  ICharacter,
  IDialogChatAction,
} from '../../interfaces';
import { GameState } from '../../stores';

import { hostilityLevelFor } from 'src/app/_shared/helpers';
import { VisibleCharactersService } from '../../app/services/visiblecharacters.service';
import { ModalService } from './modal.service';
import { OptionsService } from './options.service';
import { SocketService } from './socket.service';

export type LogMode = 'All' | 'General' | 'Combat' | 'NPC';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private bannerMessage: Subject<string> = new Subject();
  public get bannerMessage$() {
    return this.bannerMessage.asObservable();
  }

  private playGame: Subject<boolean> = new Subject();
  public get playGame$() {
    return this.playGame.asObservable();
  }

  private quitGame: Subject<void> = new Subject();
  public get quitGame$() {
    return this.quitGame.asObservable();
  }

  public currentMap = select(GameState.map);
  public inGame = select(GameState.inGame);

  private player = select(GameState.player);

  private socketService = inject(SocketService);
  private optionsService = inject(OptionsService);
  private modalService = inject(ModalService);
  private visibleCharactersService = inject(VisibleCharactersService);

  constructor() {
    effect(
      () => {
        const val = this.inGame();
        if (val) {
          this.playGame.next(true);
          this.handleAutoExec();
          return;
        }

        this.playGame.next(false);
        this.quitGame.next();
      },
      { allowSignalWrites: true },
    );
  }

  init() {}

  private handleAutoExec() {
    if (!this.optionsService.autoExec) return;

    const commands = this.optionsService.autoExec.split('\n');
    commands.forEach((cmd) => {
      this.sendCommandString(cmd);
    });
  }

  public reformatMapName(mapName: string): string {
    return this.reformatName(mapName.split('-Dungeon')[0]);
  }

  public reformatName(name: string): string {
    return startCase(name);
  }

  public sendCommandString(cmdString: string, target?: string) {
    cmdString = cmdString.replace(/\\;/g, '__SEMICOLON__');
    cmdString.split(';').forEach((cmd) => {
      cmd = cmd.trim();
      cmd = cmd.replace(/__SEMICOLON__/g, ';');
      if (cmd === '') return;

      const hadHash = cmd.startsWith('#');
      if (hadHash) cmd = cmd.substring(1);

      let command = '';
      let args = '';

      if (cmd.includes(',') && /[a-zA-Z0-9]/.test(cmd[0])) {
        command = '!privatesay';
        args = cmd;
      } else {
        [command, args] = this.parseCommand(cmd);
      }

      if (target) {
        args = `${args} ${target}`.trim();
      }

      this.checkCommandForSpecialReplacementsAndSend(command, args);
    });
  }

  private checkCommandForSpecialReplacementsAndSend(
    command: string,
    args: string,
  ) {
    // if there are no special replacements, just send the command
    if (!args.includes('$')) {
      this.sendAction(GameServerEvent.DoCommand, { command, args });
      return;
    }

    const allChars = this.visibleCharactersService.allVisibleCharacters();

    const allNPCs = () =>
      allChars
        .filter((c) => !(c as any).username)
        .filter((c) => hostilityLevelFor(this.player(), c) === 'hostile');
    const allPlayers = () => allChars.filter((c) => (c as any).username);

    const weakest = (list: ICharacter[]) =>
      sortBy(list, (c) => c.hp.current)[0];
    const strongest = (list: ICharacter[]) =>
      sortBy(list, (c) => -c.hp.current)[0];

    const closest = (list: ICharacter[]) =>
      sortBy(list, (c) => distanceFrom(this.player(), c))[0];
    const farthest = (list: ICharacter[]) =>
      sortBy(list, (c) => -distanceFrom(this.player(), c))[0];

    let newArgs = args;

    if (args.includes('$firstnpc')) {
      newArgs = newArgs.replace('$firstnpc', allNPCs()[0]?.uuid ?? '');
    }

    if (args.includes('$firstplayer')) {
      newArgs = newArgs.replace('$firstplayer', allPlayers()[0]?.uuid ?? '');
    }

    if (args.includes('$first')) {
      newArgs = newArgs.replace('$first', allChars[0]?.uuid ?? '');
    }

    if (args.includes('$randomnpc')) {
      newArgs = newArgs.replace('$randomnpc', sample(allNPCs())?.uuid ?? '');
    }

    if (args.includes('$randomplayer')) {
      newArgs = newArgs.replace(
        '$randomplayer',
        sample(allPlayers())?.uuid ?? '',
      );
    }

    if (args.includes('$random')) {
      newArgs = newArgs.replace('$random', sample(allChars)?.uuid ?? '');
    }

    if (args.includes('$strongestnpc')) {
      newArgs = newArgs.replace(
        '$strongestnpc',
        strongest(allNPCs())?.uuid ?? '',
      );
    }

    if (args.includes('$strongestplayer')) {
      newArgs = newArgs.replace(
        '$strongestplayer',
        strongest(allPlayers())?.uuid ?? '',
      );
    }

    if (args.includes('$strongest')) {
      newArgs = newArgs.replace('$strongest', strongest(allChars)?.uuid ?? '');
    }

    if (args.includes('$weakestnpc')) {
      newArgs = newArgs.replace('$weakestnpc', weakest(allNPCs())?.uuid ?? '');
    }

    if (args.includes('$weakestplayer')) {
      newArgs = newArgs.replace(
        '$weakestplayer',
        weakest(allPlayers())?.uuid ?? '',
      );
    }

    if (args.includes('$weakest')) {
      newArgs = newArgs.replace('$weakest', weakest(allChars)?.uuid ?? '');
    }

    if (args.includes('$farthestnpc')) {
      newArgs = newArgs.replace(
        '$farthestnpc',
        farthest(allNPCs())?.uuid ?? '',
      );
    }

    if (args.includes('$farthestplayer')) {
      newArgs = newArgs.replace(
        '$farthestplayer',
        farthest(allPlayers())?.uuid ?? '',
      );
    }

    if (args.includes('$farthest')) {
      newArgs = newArgs.replace('$farthest', farthest(allChars)?.uuid ?? '');
    }

    if (args.includes('$closestnpc')) {
      newArgs = newArgs.replace('$closestnpc', closest(allNPCs())?.uuid ?? '');
    }

    if (args.includes('$closestplayer')) {
      newArgs = newArgs.replace(
        '$closestplayer',
        closest(allPlayers())?.uuid ?? '',
      );
    }

    if (args.includes('$closest')) {
      newArgs = newArgs.replace('$closest', closest(allChars)?.uuid ?? '');
    }

    if (args.includes('$pet')) {
      const pet = allChars.find(
        (f) => f.effects._hash.SummonedPet?.sourceUUID === this.player().uuid,
      );
      newArgs = newArgs.replace('$pet', pet?.uuid ?? '');
    }

    this.sendAction(GameServerEvent.DoCommand, { command, args: newArgs });
  }

  public sendAction(action: GameServerEvent, args: any) {
    this.socketService.emit(action, args);
  }

  public queueAction(command: string, args?: string) {
    this.socketService.sendAction({ command, args });
  }

  private parseCommand(cmd: string) {
    const arr = cmd.split(' ');
    const multiPrefixes = [
      'party',
      'show',
      'cast',
      'stance',
      'powerword',
      'guild',
      'art',
      'findfamiliar',
      'song',
      'trade',
    ];

    let argsIndex = 1;

    let command = arr[0];

    if (multiPrefixes.includes(command)) {
      command = `${arr[0]} ${arr[1]}`;
      argsIndex = 2;
    }

    // factor in the space because otherwise indexOf can do funky things.
    const args = arr.length > argsIndex ? cmd.split(command)[1].trim() : '';

    return [command, args];
  }

  // get the direction from a character to another one
  public directionTo(
    from: { x: number; y: number; z?: number },
    to: { x: number; y: number; z?: number },
    useVertical = true,
  ): string {
    if (!to || !from) return '';

    const toZ = to.z ?? 0;
    const fromZ = from.z ?? 0;

    if (useVertical && toZ > fromZ) return 'Above';
    if (useVertical && toZ < fromZ) return 'Below';

    const diffX = to.x - from.x;
    const diffY = to.y - from.y;
    const dir = directionFromOffset(diffX, diffY);
    return directionToSymbol(dir);
  }

  public showCommandableDialog(dialogInfo: IDialogChatAction) {
    const res = this.modalService.commandDialog(dialogInfo);
    if (!res) return;

    res.subscribe((result) => {
      if (!result || result === 'noop') return;

      const npcQuery = dialogInfo.displayNPCUUID || dialogInfo.displayNPCName;
      const cmd = npcQuery ? `${npcQuery}, ${result}` : result;
      this.sendCommandString(`#${cmd}`);
    });
  }

  public sendUIBannerMessage(message: string) {
    this.bannerMessage.next(message);
  }
}
