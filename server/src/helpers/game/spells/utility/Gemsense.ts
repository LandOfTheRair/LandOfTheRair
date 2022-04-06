import { GameServerResponse, gemTextFor, ICharacter, IPlayer, ItemClass, ItemSlot, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Gemsense extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (!rightHand) {
      this.sendMessage(caster, { message: 'You do not have anything in your right hand!' });
      return;
    }

    const { itemClass } = this.game.itemHelper.getItemProperties(rightHand, ['itemClass']);

    if (itemClass !== ItemClass.Gem) {
      this.sendMessage(caster, { message: 'You do not have a gem item in your right hand!' });
      return;
    }

    const identMsg = gemTextFor(
      caster as IPlayer,
      rightHand,
      this.game.itemHelper.getItemDefinition(rightHand.name)
    );

    spellCastArgs.callbacks?.emit({
      type: GameServerResponse.SendAlert,
      title: 'Gemsense',
      content: identMsg,
      extraData: { itemName: rightHand.name, displayItemSprite: this.game.itemHelper.getItemProperty(rightHand, 'sprite') },
    });

    this.sendMessage(caster, { message: identMsg });
  }

}
