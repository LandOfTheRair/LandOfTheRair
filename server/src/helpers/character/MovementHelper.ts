import { Injectable } from 'injection-js';
import { clamp, isUndefined } from 'lodash';

import { BaseService, ICharacter, Stat } from '../../interfaces';
import { CharacterHelper } from './CharacterHelper';

@Injectable()
export class MovementHelper extends BaseService {

  constructor(
    private characterHelper: CharacterHelper
  ) {
    super();
  }

  init() {}

  moveWithPathfinding(character: ICharacter, { xDiff, yDiff }): void {

    if (isUndefined(xDiff) || isUndefined(yDiff)) return;

    const maxMoveRate = this.characterHelper.getStat(character, Stat.Move);
    if (maxMoveRate <= 0) return;

    xDiff = clamp(-4, 4, xDiff);
    yDiff = clamp(-4, 4, yDiff);

    character.x = character.x + xDiff;
    character.y = character.y + yDiff;

    console.log(character.x, character.y);
  }
}
