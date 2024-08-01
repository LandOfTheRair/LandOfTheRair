import { effect, inject, Injectable } from '@angular/core';
import { select } from '@ngxs/store';
import {
  get,
  isBoolean,
  isNumber,
  maxBy,
  sample,
  sortBy,
  startCase,
} from 'lodash';
import { Subject } from 'rxjs';

import {
  Alignment,
  Allegiance,
  Direction,
  directionFromOffset,
  directionToSymbol,
  distanceFrom,
  FOVVisibility,
  GameServerEvent,
  Hostility,
  ICharacter,
  IDialogChatAction,
  INPC,
  IPlayer,
  isHostileTo,
  Stat,
} from '../../interfaces';
import { GameState } from '../../stores';

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
  private allCharacters = select(GameState.allCharacters);

  // character list stuff
  private currentCharacter: ICharacter = null;
  private previousPlacements: Record<string, number> = {};

  private visibleCharacterList: ICharacter[] = [];
  public get allVisibleCharacters(): ICharacter[] {
    return this.visibleCharacterList;
  }

  private socketService = inject(SocketService);
  private optionsService = inject(OptionsService);
  private modalService = inject(ModalService);

  constructor() {
    effect(() => {
      const val = this.inGame();
      if (val) {
        this.playGame.next(true);
        this.handleAutoExec();
        return;
      }

      this.playGame.next(false);
      this.quitGame.next();
    });
  }

  init() {}

  public updateCharacterList(player: IPlayer) {
    this.currentCharacter = player;
    this.visibleCharacterList = this.visibleCharacters(player).filter(Boolean);
  }

  private visibleCharacters(player: IPlayer): ICharacter[] {
    if (!player || this.allCharacters.length === 0) return [];
    const fov = player.fov;
    const allCharacters = this.allCharacters();

    let unsorted: any[] = allCharacters
      .map((testChar) => {
        if ((testChar as IPlayer).username === player.username) return false;
        if (testChar.dir === Direction.Center || testChar.hp.current === 0) {
          return false;
        }

        const diffX = testChar.x - player.x;
        const diffY = testChar.y - player.y;

        const canSee = get(fov, [diffX, diffY]) >= FOVVisibility.CanSee;
        if (!canSee) return false;

        return testChar;
      })
      .filter(Boolean);

    if (unsorted.length === 0) return [];

    const shouldSortDistance = this.optionsService.sortByDistance;
    const shouldSortFriendly = this.optionsService.sortFriendlies;

    // iterate over unsorted, find their place, or find them a new place (only if we are doing no sorting)
    if (!isBoolean(shouldSortDistance) && !isBoolean(shouldSortFriendly)) {
      const highestOldSpace =
        this.previousPlacements[
          maxBy(
            Object.keys(this.previousPlacements),
            (key) => this.previousPlacements[key],
          )
        ];
      const oldPositionSorting = Array(highestOldSpace).fill(null);
      const newPositionHash = {};

      const unfilledSpaces = oldPositionSorting.reduce((prev, cur, idx) => {
        prev[idx] = null;
        return prev;
      }, {});

      const needFill = [];

      // sort old creatures into the array, and if they weren't there before, we mark them as filler
      for (let i = 0; i < unsorted.length; i++) {
        const creature = unsorted[i];

        const oldPos = this.previousPlacements[creature.uuid];
        if (isNumber(oldPos)) {
          oldPositionSorting[oldPos] = creature;
          delete unfilledSpaces[oldPos];
        } else {
          needFill.push(creature);
        }
      }

      // get all the filler spaces, and put the unsorted creatures into them
      const fillKeys = Object.keys(unfilledSpaces);

      for (let i = 0; i < needFill.length; i++) {
        const fillSpot = fillKeys.shift();
        if (fillSpot) {
          oldPositionSorting[+fillSpot] = needFill[i];
        } else {
          oldPositionSorting.push(needFill[i]);
        }
      }

      // create a new position hash
      for (let i = 0; i < oldPositionSorting.length; i++) {
        const creature = oldPositionSorting[i];
        if (!creature) continue;

        newPositionHash[creature.uuid] = i;
      }

      this.previousPlacements = newPositionHash;
      unsorted = oldPositionSorting;
    }

    // sort them by distance
    if (isBoolean(shouldSortDistance)) {
      unsorted = sortBy(unsorted, (testChar) => distanceFrom(player, testChar));

      if (!shouldSortDistance) unsorted = unsorted.reverse();
    }

    // sort them by friendly
    if (isBoolean(shouldSortFriendly)) {
      const sortOrder = shouldSortFriendly
        ? { friendly: 0, neutral: 1, hostile: 2 }
        : { hostile: 0, neutral: 1, friendly: 2 };
      unsorted = sortBy(
        unsorted,
        (testChar) => sortOrder[this.hostilityLevelFor(player, testChar)],
      );
    }

    return unsorted;
  }

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

    const allChars = this.allVisibleCharacters;

    const allNPCs = () => allChars.filter((c) => !(c as any).username);
    const allPlayers = () => allChars.filter((c) => (c as any).username);

    const weakest = (list: ICharacter[]) =>
      sortBy(list, (c) => c.hp.current)[0];
    const strongest = (list: ICharacter[]) =>
      sortBy(list, (c) => -c.hp.current)[0];

    const closest = (list: ICharacter[]) =>
      sortBy(list, (c) => distanceFrom(this.currentCharacter, c))[0];
    const farthest = (list: ICharacter[]) =>
      sortBy(list, (c) => -distanceFrom(this.currentCharacter, c))[0];

    let newArgs = args;

    if (args.includes('$firstnpc')) {
      newArgs = newArgs.replace(
        '$firstnpc',
        allChars.find((c) => !(c as any).username)?.uuid ?? '',
      );
    }
    if (args.includes('$firstplayer')) {
      newArgs = newArgs.replace(
        '$firstplayer',
        allChars.find((c) => (c as any).username)?.uuid ?? '',
      );
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
      'look',
      'show',
      'cast',
      'stance',
      'powerword',
      'art',
      'findfamiliar',
      'song',
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

  // check the hostility level between two characters
  // any changes here _might_ need to be made to server/checkTargetForHostility
  public hostilityLevelFor(
    origin: ICharacter,
    compare: ICharacter,
  ): 'hostile' | 'neutral' | 'friendly' | 'stealth' {
    const isHiddenTo = () =>
      origin.effects._hash.Hidden &&
      (origin.totalStats?.[Stat.Stealth] ?? 0) >
        (compare.totalStats?.[Stat.Perception] ?? 0);
    const alignmentConsideringHidden = () =>
      isHiddenTo() ? 'stealth' : 'hostile';

    if (!origin) return 'neutral';

    if (origin.allegiance === Allegiance.GM) return 'neutral';
    if (compare.allegiance === Allegiance.NaturalResource) return 'neutral';

    if (
      (origin as IPlayer).partyName &&
      (origin as IPlayer).partyName === (compare as IPlayer).partyName
    ) {
      return 'neutral';
    }

    if (compare.agro[origin.uuid] || origin.agro[compare.uuid]) {
      return alignmentConsideringHidden();
    }

    if (
      origin.effects._hash.Disguise &&
      origin.totalStats[Stat.CHA] > compare.totalStats[Stat.WIL]
    ) {
      return 'stealth';
    }

    const hostility = (compare as INPC).hostility;

    if (!hostility) return 'neutral';

    if (hostility === Hostility.Never) return 'friendly';

    if (hostility === Hostility.Faction) {
      if (
        isHostileTo(origin, compare.allegiance) ||
        isHostileTo(compare, origin.allegiance)
      ) {
        return alignmentConsideringHidden();
      }
    }

    if (origin.allegiance === compare.allegiance) return 'neutral';

    if (hostility === Hostility.Always) return alignmentConsideringHidden();

    if (
      origin.alignment === Alignment.Evil &&
      compare.alignment === Alignment.Good
    ) {
      return alignmentConsideringHidden();
    }

    return 'neutral';
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
