import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';
import { ICharacter, initializeCharacter } from '../interfaces';

const defaultCharacter: () => ICharacter = () => {
  return initializeCharacter();
};

@State<ICharacter>({
  name: 'character',
  defaults: defaultCharacter()
})
@Injectable()
export class CharacterState {

}
