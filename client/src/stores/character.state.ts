import { State } from '@ngxs/store';
import { Allegiance, BaseClass, ICharacter } from '../models';

const defaultCharacter: () => ICharacter = () => {
  return {
    name: '',
    allegiance: Allegiance.None,
    baseClass: BaseClass.Undecided,
    gender: 'male',
    currency: { gold: 0 },
    map: 'Tutorial',
    x: 0,
    y: 0,
    charSlot: 0,
    items: { potion: null, equipment: null, sack: null, belt: null, pouch: null },
    stats: {}
  };
};

@State<ICharacter>({
  name: 'character',
  defaults: defaultCharacter()
})
export class CharacterState {

}
