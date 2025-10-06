import { effect, inject, Injectable, signal } from '@angular/core';
import { select } from '@ngxs/store';
import { get, isBoolean, isNumber, maxBy, sortBy } from 'lodash';
import { timer } from 'rxjs';

import {
  Direction,
  FOVVisibility,
  ICharacter,
  IPlayer,
} from '@lotr/interfaces';
import { GameState } from '../../stores';

import { toSignal } from '@angular/core/rxjs-interop';
import { distanceFrom } from '@lotr/shared';
import { hostilityLevelFor } from '../_shared/helpers';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root',
})
export class VisibleCharactersService {
  public currentMap = select(GameState.map);
  public inGame = select(GameState.inGame);

  private curPos = select(GameState.currentPosition);
  private player = select(GameState.player);
  private allCharacters = select(GameState.allCharacters);

  private optionsService = inject(OptionsService);

  private previousPlacements: Record<string, number> = {};
  public allVisibleCharacters = signal<Array<ICharacter | null>>([]);

  constructor() {
    const visibleCharacterUpdateTimer = toSignal(timer(0, 200));
    effect(
      () => {
        visibleCharacterUpdateTimer();
        this.curPos();

        this.allVisibleCharacters.set(this.visibleCharacters(this.player()));
      },
      { allowSignalWrites: true },
    );
  }

  private visibleCharacters(player: IPlayer): ICharacter[] {
    if (!player || this.allCharacters().length === 0) return [];
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
        (testChar) => sortOrder[hostilityLevelFor(player, testChar)],
      );
    }

    return unsorted;
  }
}
