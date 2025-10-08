import type { ICharacter, SpellCastArgs } from '@lotr/interfaces';
import { ItemSlot } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Wellspring extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (rightHand) {
      this.sendMessage(caster, { message: 'You need to empty right hand!' });
      this.game.spellManager.resetCooldown(caster, 'Wellspring');
      return;
    }

    this.sendMessage(caster, {
      message: 'You channel holy energy into a bottle.',
    });

    const wellspringItem = this.game.itemCreator.getSimpleItem('Holy Water');

    this.game.characterHelper.setRightHand(caster, wellspringItem);
  }
}
