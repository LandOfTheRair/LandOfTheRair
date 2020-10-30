import { State } from '@ngxs/store';
import { ICharacter, initializeCharacter } from '../interfaces';

const defaultCharacter: () => ICharacter = () => {
  return initializeCharacter();
};

@State<ICharacter>({
  name: 'character',
  defaults: defaultCharacter()
})
export class CharacterState {

}
