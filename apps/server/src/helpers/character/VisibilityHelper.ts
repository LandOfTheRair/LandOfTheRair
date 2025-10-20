import { Injectable } from 'injection-js';

import { get, setWith } from 'lodash';

import { getStat, perceptionGet } from '@lotr/characters';
import { settingClassConfigGet, traitLevel } from '@lotr/content';
import { transmissionFOVPatchSend, worldGetMapAndState } from '@lotr/core';
import { darknessIsDarkAt, hasEffect } from '@lotr/effects';
import type {
  ICharacter,
  INPC,
  IPlayer,
  IVisibilityHelper,
} from '@lotr/interfaces';
import { Allegiance, FOVVisibility, Stat } from '@lotr/interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class VisibilityHelper extends BaseService implements IVisibilityHelper {
  public init() {}

  // specifically calculate fov for players and update it afterwards
  calculatePlayerFOV(player: IPlayer, sendFOV = true): void {
    this.calculateFOV(player);

    if (sendFOV) {
      transmissionFOVPatchSend(player);
    }
  }

  // calculate a fov for a character and set it
  calculateFOV(character: ICharacter): void {
    const map = worldGetMapAndState(character.map)?.map;
    if (!map) return;

    const affected = {};

    const dist = 4;

    // blind OR dark and no darkvision
    if (
      hasEffect(character, 'Blind') ||
      (darknessIsDarkAt(character.map, character.x, character.y) &&
        !hasEffect(character, 'DarkVision'))
    ) {
      for (let xx = character.x - dist; xx <= character.x + dist; xx++) {
        for (let yy = character.y - dist; yy <= character.y + dist; yy++) {
          setWith(
            affected,
            [xx - character.x, yy - character.y],
            FOVVisibility.CantSee,
            Object,
          );
        }
      }

      // no dark, calculate fov
    } else {
      map.fovCalculator.compute(
        character.x,
        character.y,
        dist,
        (x, y) =>
          get(affected, [x - character.x, y - character.y]) >=
          FOVVisibility.CanSee,
        (x, y) => {
          if (
            darknessIsDarkAt(character.map, x, y) &&
            hasEffect(character, 'DarkVision')
          ) {
            setWith(
              affected,
              [x - character.x, y - character.y],
              FOVVisibility.CanSeeButDark,
              Object,
            );
          } else {
            setWith(
              affected,
              [x - character.x, y - character.y],
              FOVVisibility.CanSee,
              Object,
            );
          }
        },
      );

      if (!hasEffect(character, 'DarkVision')) {
        for (let xx = character.x - dist; xx <= character.x + dist; xx++) {
          for (let yy = character.y - dist; yy <= character.y + dist; yy++) {
            if (!darknessIsDarkAt(character.map, xx, yy)) continue;
            setWith(
              affected,
              [xx - character.x, yy - character.y],
              FOVVisibility.CantSee,
              Object,
            );
          }
        }
      }
    }

    if (hasEffect(character, 'WallSight')) {
      for (let xx = character.x - dist; xx <= character.x + dist; xx++) {
        for (let yy = character.y - dist; yy <= character.y + dist; yy++) {
          setWith(
            affected,
            [xx - character.x, yy - character.y],
            FOVVisibility.CanSee,
            Object,
          );
        }
      }
    }

    character.fov = affected;
  }

  // whether or not someone can see a spot in their FOV
  public canSee(char: ICharacter, xOffset: number, yOffset: number): boolean {
    return get(char.fov, [xOffset, yOffset]) >= FOVVisibility.CanSee;
  }

  // whether or not this spot is hideable (near a wall, or in dark)
  public canContinueHidingAtSpot(char: ICharacter): boolean {
    const map = worldGetMapAndState(char.map)?.map;
    if (!map) return false;

    if (darknessIsDarkAt(char.map, char.x, char.y)) return true;
    if (!map.checkIfCanHideAt(char.x, char.y)) return false;

    return true;
  }

  // whether or not someone can hide
  public canHide(char: ICharacter): boolean {
    if (hasEffect(char, 'Revealed')) return false;
    if (hasEffect(char, 'Hidden')) return false;
    if (hasEffect(char, 'Singing') && !traitLevel(char, 'Shadowsong')) {
      return false;
    }

    const requiresMPToHide = settingClassConfigGet<'requiresMPToHide'>(
      char.baseClass,
      'requiresMPToHide',
    );

    if (requiresMPToHide && char.mp.current <= 0) return false;

    if (!this.canContinueHidingAtSpot(char)) return false;

    return true;
  }

  // the reason you can't hide
  public reasonUnableToHide(char: ICharacter): string {
    if (hasEffect(char, 'Revealed')) {
      return 'You cannot hide right now!';
    }
    if (hasEffect(char, 'Hidden')) {
      return 'You are already hidden!';
    }

    const requiresMPToHide = settingClassConfigGet<'requiresMPToHide'>(
      char.baseClass,
      'requiresMPToHide',
    );

    if (requiresMPToHide && char.mp.current <= 0) {
      return 'You do not have the energy to hide!';
    }

    if (!this.canContinueHidingAtSpot(char)) return 'You cannot hide here!';

    return '';
  }

  // whether or not someone can see through another characters potential stealth
  public canSeeThroughStealthOf(char: ICharacter, hiding: ICharacter): boolean {
    if (!char || !hiding) return false;

    // if the looker is a GM, they can see everything
    if (char.allegiance === Allegiance.GM) return true;

    // some creatures appear *only* for certain others (thanksgiving, etc)
    if (
      (hiding as INPC).onlyVisibleTo &&
      (hiding as INPC).onlyVisibleTo !== char.uuid
    ) {
      return false;
    }

    // if in same party, they can always see each other
    if (
      (hiding as IPlayer).partyName &&
      (char as IPlayer).partyName === (hiding as IPlayer).partyName
    ) {
      return true;
    }

    // if the hider is invisible and the seer does not have truesight, they are not visible
    if (hasEffect(hiding, 'Invisibility') && !hasEffect(char, 'TrueSight')) {
      return false;
    }

    // nothing can see shadowmeld
    if (hasEffect(hiding, 'Shadowmeld')) return false;

    // last are stealth checks, if you have hidden it triggers the perception/stealth checks
    if (hasEffect(hiding, 'Hidden')) {
      // perception is simple: stats + level. thieves get a multiplier
      const perception = perceptionGet(char);

      // stealth is also simple: stats + level + skill. thieves get a multiplier
      const stealth = getStat(hiding, Stat.Stealth);

      const canSee = perception > stealth;

      return canSee;
    }

    return true;
  }
}
