import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { isNumber, maxBy, sortBy } from 'lodash';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription, timer } from 'rxjs';
import { Direction, GameOption, ICharacter, IPlayer } from '../../../../interfaces';
import { GameState, SetCurrentTarget, SettingsState } from '../../../../stores';

import { GameService } from '../../../game.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.allCharacters) characters$: Observable<ICharacter[]>;
  @Select(GameState.currentPosition) pos$: Observable<{ x: number, y: number }>;
  @Select(SettingsState.options) options$: Observable<Record<GameOption, number|boolean>>;

  charSub: Subscription;
  playerSub: Subscription;
  optionSub: Subscription;
  timerSub: Subscription;
  moveSub: Subscription;

  public shouldPin: boolean;
  public shouldSortFriendly: boolean;
  public shouldSortDistance: boolean;

  public player: IPlayer;
  public visibleCharacterList: ICharacter[] = [];
  private allCharacters: ICharacter[] = [];
  private previousPlacements: { [key: string]: number } = {};

  constructor(
    private store: Store,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.playerSub = this.player$.subscribe(p => this.player = p);
    this.charSub = this.characters$.subscribe(c => this.allCharacters = c);
    this.optionSub = this.options$.subscribe(options => {
      this.shouldPin = options[GameOption.PinLastTarget] as boolean;
      this.shouldSortFriendly = options[GameOption.ShouldSortFriendly] as boolean;
      this.shouldSortDistance = options[GameOption.ShouldSortDistance] as boolean;
    });

    this.timerSub = timer(0, 500).subscribe(() => this.updateCharacterList());
    this.moveSub = this.pos$.subscribe(() => this.updateCharacterList());
  }

  ngOnDestroy() {}

  private updateCharacterList() {
    this.visibleCharacterList = this.visibleCharacters();
  }

  private visibleCharacters(): ICharacter[] {
    if (!this.player || this.allCharacters.length === 0) return [];
    const fov = this.player.fov;
    const allCharacters = this.allCharacters;

    let unsorted: any[] = allCharacters.map(testChar => {
      if ((testChar as IPlayer).username === this.player.username) return false;
      if (testChar.dir === Direction.Corpse || testChar.hp.__current === 0) return false;
      // TODO: stealth
      // if(!me.canSeeThroughStealthOf(testnpc)) return false;
      const diffX = testChar.x - this.player.x;
      const diffY = testChar.y - this.player.y;

      if (!fov[diffX]) return false;
      if (!fov[diffX][diffY]) return false;

      return testChar;
    }).filter(Boolean);

    if (unsorted.length === 0) return [];

    const shouldSortDistance = this.shouldSortDistance;
    const shouldSortFriendly = this.shouldSortFriendly;

    // iterate over unsorted, find their place, or find them a new place (only if we are doing no sorting)
    if (!shouldSortDistance && !shouldSortFriendly) {
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
    if (shouldSortDistance) {
      unsorted = sortBy(unsorted, testChar => testChar.distFrom(this.player));

      if (!this.shouldSortDistance) unsorted = unsorted.reverse();
    }

    // sort them by friendly
    if (shouldSortFriendly) {
      const sortOrder = this.shouldSortFriendly ? { neutral: 0, friendly: 1, hostile: 2 } : { hostile: 0, neutral: 1, friendly: 2 };
      unsorted = sortBy(unsorted, testChar => sortOrder[this.gameService.hostilityLevelFor(this.player, testChar)]);
    }

    return unsorted;
  }

  public doAction(char: ICharacter, $event, index) {
    this.store.dispatch(new SetCurrentTarget(char.uuid));
  }

  public doAltAction(char: ICharacter) {

  }

}
