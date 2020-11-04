
import { Injectable } from 'injection-js';

import { get, setWith } from 'lodash';

import { BaseService, ICharacter } from '../../interfaces';
import { Player } from '../../models';
import { WorldManager } from '../data';

@Injectable()
export class VisibilityHelper extends BaseService {

  constructor(
    private worldManager: WorldManager
  ) {
    super();
  }

  public init() {}

  // specifically calculate fov for players and update it afterwards
  calculatePlayerFOV(player: Player): void {
    this.calculateFOV(player);
    this.game.transmissionHelper.queuePlayerPatch(player, { player: { fov: player.fov } });
  }

  // calculate a fov for a character and set it
  calculateFOV(character: ICharacter): void {

    const { map } = this.worldManager.getMap(character.map);

    const affected = {};

    const dist = 4;

    // darkness obscures all vision
    /*
    if(character.hasEffect('Blind') || (this.isDarkAt(character.x, character.y) && !character.hasEffect('DarkVision'))) {
      for(let xx = character.x - dist; xx <= character.x + dist; xx++) {
        for(let yy = character.y - dist; yy <= character.y + dist; yy++) {
          affected[xx - character.x] = affected[xx - character.x] || {};
          affected[xx - character.x][yy - character.y] = false;
        }
      }
    */
    if (false) {

    // no dark, calculate fov
    } else {
      map.fovCalculator.compute(
        character.x, character.y, dist,
      (x, y) => {
        return get(affected, [x - character.x, y - character.y]);
      },
      (x, y) => {
        setWith(affected, [x - character.x, y - character.y], true, Object);
      });

      /*
      if(!character.hasEffect('DarkVision')) {
        for(let xx = character.x - dist; xx <= character.x + dist; xx++) {
          for(let yy = character.y - dist; yy <= character.y + dist; yy++) {
            if(!this.isDarkAt(xx, yy)) continue;
            affected[xx - character.x] = affected[xx - character.x] || {};
            affected[xx - character.x][yy - character.y] = false;
          }
        }
      }
      */
    }

    /*
    if(character.hasEffect('WallSight')) {
      for(let xx = character.x - dist; xx <= character.x + dist; xx++) {
        for(let yy = character.y - dist; yy <= character.y + dist; yy++) {
          affected[xx - character.x] = affected[xx - character.x] || {};
          affected[xx - character.x][yy - character.y] = true;
        }
      }
    }
    */

    character.fov = affected;


  }

  public canSee(char: ICharacter, xOffset: number, yOffset: number): boolean {
    if (!char.fov) return false;
    if (!char.fov[xOffset]) return false;
    if (!char.fov[xOffset][yOffset]) return false;
    return true;
  }

}
