import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { get, isBoolean, isNumber, isUndefined, maxBy, sortBy } from 'lodash';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { combineLatest, Observable, Subscription, timer } from 'rxjs';
import { first } from 'rxjs/operators';
import { Direction, distanceFrom, FOVVisibility, GameServerResponse,
  Hostility, ICharacter, IMacro, INPC, IPlayer, ItemSlot } from '../../../../interfaces';
import { GameState, SetCurrentCommand, SetCurrentTarget, SettingsState, ViewCharacterEquipment } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { MacrosService } from '../../../services/macros.service';
import { OptionsService } from '../../../services/options.service';
import { SocketService } from '../../../services/socket.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.allCharacters) characters$: Observable<ICharacter[]>;
  @Select(GameState.currentPosition) pos$: Observable<{ x: number; y: number }>;
  @Select(SettingsState.currentCommand) command$: Observable<string>;
  @Select(MacrosService.currentPlayerActiveMacro) macro$: Observable<IMacro>;

  charSub: Subscription;
  playerSub: Subscription;
  timerSub: Subscription;
  moveSub: Subscription;

  public player: IPlayer;
  public visibleCharacterList: ICharacter[] = [];
  private allCharacters: ICharacter[] = [];
  private previousPlacements: Record<string, number> = {};

  public disableInteractions = false;

  constructor(
    private store: Store,
    private socketService: SocketService,
    private optionsService: OptionsService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.playerSub = this.player$.subscribe(p => this.player = p);
    this.charSub = this.characters$.subscribe(c => this.allCharacters = c);

    this.timerSub = timer(0, 500).subscribe(() => this.updateCharacterList());
    this.moveSub = this.pos$.subscribe(() => this.updateCharacterList());

    this.socketService.registerComponentCallback('CharacterList', GameServerResponse.GameLog, (data) => {
      if (isUndefined(data.setTarget)) return;
      this.store.dispatch(new SetCurrentTarget(data.setTarget));
    });
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks('CharacterList');
  }

  private updateCharacterList() {
    this.visibleCharacterList = this.visibleCharacters();
  }

  private visibleCharacters(): ICharacter[] {
    if (!this.player || this.allCharacters.length === 0) return [];
    const fov = this.player.fov;
    const allCharacters = this.allCharacters;

    let unsorted: any[] = allCharacters.map(testChar => {
      if ((testChar as IPlayer).username === this.player.username) return false;
      if (testChar.dir === Direction.Center || testChar.hp.current === 0) return false;

      const diffX = testChar.x - this.player.x;
      const diffY = testChar.y - this.player.y;

      const canSee = get(fov, [diffX, diffY]) >= FOVVisibility.CanSee;
      if (!canSee) return false;

      return testChar;
    }).filter(Boolean);

    if (unsorted.length === 0) return [];

    const shouldSortDistance = this.optionsService.sortByDistance;
    const shouldSortFriendly = this.optionsService.sortFriendlies;

    // iterate over unsorted, find their place, or find them a new place (only if we are doing no sorting)
    if (!isBoolean(shouldSortDistance) && !isBoolean(shouldSortFriendly)) {
      const highestOldSpace = this.previousPlacements[maxBy(Object.keys(this.previousPlacements), key => this.previousPlacements[key])];
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
      unsorted = sortBy(unsorted, testChar => distanceFrom(this.player, testChar));

      if (!shouldSortDistance) unsorted = unsorted.reverse();
    }

    // sort them by friendly
    if (isBoolean(shouldSortFriendly)) {
      const sortOrder = shouldSortFriendly ? { friendly: 0, neutral: 1, hostile: 2 } : { hostile: 0, neutral: 1, friendly: 2 };
      unsorted = sortBy(unsorted, testChar => sortOrder[this.gameService.hostilityLevelFor(this.player, testChar)]);
    }

    return unsorted;
  }

  public doAction(char: ICharacter, $event?: any) {

    if (this.disableInteractions) return;

    // can't interact with the dead
    if (char.hp.current <= 0) return;

    // if they're not green, we can target them for future interactions
    if ((char as INPC).hostility !== Hostility.Never) {
      this.store.dispatch(new SetCurrentTarget(char.uuid));
    }

    // only select the target if we hit ctrl
    if ($event?.ctrlKey) return;

    // disable ui interactions for a bit so we don't spam
    this.disableInteractions = true;
    setTimeout(() => {
      this.disableInteractions = false;
    }, 250);

    combineLatest([this.command$, this.macro$])
      .pipe(first())
      .subscribe(([cmd, macro]) => {
        if ((char as INPC).hostility === Hostility.Never) {
          this.gameService.sendCommandString(`${char.uuid}, hello`);

        } else if ((char as INPC).hostility === Hostility.OnHit && this.optionsService.dontAttackGreys) {
          this.store.dispatch(new SetCurrentCommand(`${char.name}, `));

        } else if ((char as IPlayer).username && !cmd && this.gameService.hostilityLevelFor(this.player, char) !== 'hostile') {
          this.store.dispatch(new SetCurrentCommand(`#${(char as IPlayer).name}, `));

        } else if (cmd) {
          this.gameService.sendCommandString(cmd, char.uuid);
          this.store.dispatch(new SetCurrentCommand(''));

        } else if (macro) {
          this.gameService.sendCommandString(macro.macro, char.uuid);
        }

      });
  }

  public doAltAction(player: ICharacter, char: ICharacter, $event?: any) {

    $event?.preventDefault();
    $event?.stopPropagation();

    // we can view characters loadouts
    if ((char as IPlayer).username) {
      this.store.dispatch(new ViewCharacterEquipment(char));
      return;
    }

    if (player.items.equipment[ItemSlot.RightHand]?.name === 'Halloween Basket' && (char as INPC).hostility === Hostility.Never) {
      this.gameService.sendCommandString(`${char.uuid}, trick or treat`);
      return;
    }

    this.doAction(char, $event);
  }

}
