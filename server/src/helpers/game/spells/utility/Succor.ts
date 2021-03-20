import { ICharacter, IPlayer, ItemSlot, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Succor extends Spell {

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (rightHand) {
      this.sendMessage(caster, { message: 'You need to empty right hand!' });
      return;
    }

    const map = this.game.worldManager.getMap(caster.map).map;
    if (!map.canSuccor(caster as IPlayer)) {
      return this.sendMessage(caster, { message: 'A haze clouds your mind.' });
    }

    this.sendMessage(caster, { message: 'You channel your memories of this place into a ball of magical energy.' });

    const succorItem = this.game.itemCreator.createSuccorItem(
      caster.map, caster.x, caster.y, this.game.subscriptionHelper.maxSuccorOz(caster as IPlayer, 1)
    );

    this.game.characterHelper.setRightHand(caster, succorItem);

  }

}
