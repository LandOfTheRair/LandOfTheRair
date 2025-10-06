import { Injectable } from 'injection-js';

import { get, setWith } from 'lodash';

import type { ICharacter, INPC, IPlayer } from '@lotr/interfaces';
import { Allegiance, FOVVisibility, Stat } from '@lotr/interfaces';
import type { Player } from '../../models';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class VisibilityHelper extends BaseService {
  public init() {}

  // specifically calculate fov for players and update it afterwards
  calculatePlayerFOV(player: Player, sendFOV = true): void {
    this.calculateFOV(player);

    if (sendFOV) {
      this.game.transmissionHelper.sendFOVPatch(player);
    }
  }

  // calculate a fov for a character and set it
  calculateFOV(character: ICharacter): void {
    const map = this.game.worldManager.getMap(character.map)?.map;
    if (!map) return;

    const affected = {};

    const dist = 4;

    // blind OR dark and no darkvision
    if (
      this.game.effectHelper.hasEffect(character, 'Blind') ||
      (this.isDarkAt(character.map, character.x, character.y) &&
        !this.game.effectHelper.hasEffect(character, 'DarkVision'))
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
            this.isDarkAt(character.map, x, y) &&
            this.game.effectHelper.hasEffect(character, 'DarkVision')
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

      if (!this.game.effectHelper.hasEffect(character, 'DarkVision')) {
        for (let xx = character.x - dist; xx <= character.x + dist; xx++) {
          for (let yy = character.y - dist; yy <= character.y + dist; yy++) {
            if (!this.isDarkAt(character.map, xx, yy)) continue;
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

    if (this.game.effectHelper.hasEffect(character, 'WallSight')) {
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

  public isDarkAt(map: string, x: number, y: number): boolean {
    return this.game.darknessHelper.isDarkAt(map, x, y);
  }

  // whether or not this spot is hideable (near a wall, or in dark)
  public canContinueHidingAtSpot(char: ICharacter): boolean {
    const map = this.game.worldManager.getMap(char.map)?.map;
    if (!map) return false;

    if (this.isDarkAt(char.map, char.x, char.y)) return true;
    if (!map.checkIfCanHideAt(char.x, char.y)) return false;

    return true;
  }

  // whether or not someone can hide
  public canHide(char: ICharacter): boolean {
    if (this.game.effectHelper.hasEffect(char, 'Revealed')) return false;
    if (this.game.effectHelper.hasEffect(char, 'Hidden')) return false;
    if (
      this.game.effectHelper.hasEffect(char, 'Singing') &&
      !this.game.traitHelper.traitLevel(char, 'Shadowsong')
    ) {
      return false;
    }

    const requiresMPToHide =
      this.game.contentManager.getClassConfigSetting<'requiresMPToHide'>(
        char.baseClass,
        'requiresMPToHide',
      );

    if (requiresMPToHide && char.mp.current <= 0) return false;

    if (!this.canContinueHidingAtSpot(char)) return false;

    return true;
  }

  // the reason you can't hide
  public reasonUnableToHide(char: ICharacter): string {
    if (this.game.effectHelper.hasEffect(char, 'Revealed')) {
      return 'You cannot hide right now!';
    }
    if (this.game.effectHelper.hasEffect(char, 'Hidden')) {
      return 'You are already hidden!';
    }

    const requiresMPToHide =
      this.game.contentManager.getClassConfigSetting<'requiresMPToHide'>(
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
    if (
      this.game.effectHelper.hasEffect(hiding, 'Invisibility') &&
      !this.game.effectHelper.hasEffect(char, 'TrueSight')
    ) {
      return false;
    }

    // nothing can see shadowmeld
    if (this.game.effectHelper.hasEffect(hiding, 'Shadowmeld')) return false;

    // last are stealth checks, if you have hidden it triggers the perception/stealth checks
    if (this.game.effectHelper.hasEffect(hiding, 'Hidden')) {
      // perception is simple: stats + level. thieves get a multiplier
      const perception = this.game.characterHelper.getPerception(char);

      // stealth is also simple: stats + level + skill. thieves get a multiplier
      const stealth = this.game.characterHelper.getStat(hiding, Stat.Stealth);

      const canSee = perception > stealth;

      return canSee;
    }

    return true;
  }
}
