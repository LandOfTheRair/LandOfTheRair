
import { Injectable } from 'injection-js';

import { BaseService, ICharacter } from '../../interfaces';

@Injectable()
export class InteractionHelper extends BaseService {

  public init() {}

  // TODO: open doors
  public tryToOpenDoor(character: ICharacter, door: any): boolean {
    return false;
  }

}
