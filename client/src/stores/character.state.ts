import { State } from '@ngxs/store';
import { ICharacter, initializeCharacter } from '../models';

const defaultCharacter: () => ICharacter = () => {
  return initializeCharacter();
};

@State<ICharacter>({
  name: 'character',
  defaults: defaultCharacter()
})
export class CharacterState {

}
