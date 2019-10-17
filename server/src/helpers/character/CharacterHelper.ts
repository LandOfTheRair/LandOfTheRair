import { Singleton } from 'typescript-ioc';
import { ICharacter } from '../../interfaces';

@Singleton
export class CharacterHelper {

  public init() {}

  public getStat(character: ICharacter): number {
    return 0;
  }

}
