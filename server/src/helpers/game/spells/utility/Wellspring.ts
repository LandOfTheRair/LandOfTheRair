import { ICharacter, ItemSlot, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Wellspring extends Spell {

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (rightHand) {
      this.sendMessage(caster, { message: 'You need to empty right hand!' });
      return;
    }

    this.sendMessage(caster, { message: 'You channel holy energy into a bottle.' });

    const wellspringItem = this.game.itemCreator.getSimpleItem('Holy Water');

    this.game.characterHelper.setRightHand(caster, wellspringItem);

  }

}
