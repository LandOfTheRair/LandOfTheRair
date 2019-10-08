import { ICharacter } from '../models';
import { State } from '@ngxs/store';

const defaultCharacter: () => ICharacter = () => {
  return {
    name: '',
    allegiance: 'None',
    baseclass: 'Undecided',
    gender: 'male',
    gold: 0,
    items: [],
    mapName: 'Tutorial',
    skills: [],
    stats: [],
    x: 0,
    y: 0,
    slot: 0
  };
};

@State<ICharacter>({
  name: 'character',
  defaults: defaultCharacter()
})
export class CharacterState {

}
