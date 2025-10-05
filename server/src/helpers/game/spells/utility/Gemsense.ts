import { gemTextFor } from '../../../../helpers';
import {
  GameServerResponse,
  ICharacter,
  IPlayer,
  ItemClass,
  ItemSlot,
  SpellCastArgs,
} from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Gemsense extends Spell {
  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
    spellCastArgs: SpellCastArgs,
  ): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (!rightHand) {
      this.sendMessage(caster, {
        message: 'You do not have anything in your right hand!',
      });
      return;
    }

    const { itemClass, encrustItem } = this.game.itemHelper.getItemProperties(
      rightHand,
      ['itemClass', 'encrustItem'],
    );

    if (!encrustItem && itemClass !== ItemClass.Gem) {
      this.sendMessage(caster, {
        message: 'You do not have a gem or encrusted item in your right hand!',
      });
      return;
    }

    const itemDef = this.game.itemHelper.getItemDefinition(
      encrustItem || rightHand.name,
    );

    const identMsg = gemTextFor(caster as IPlayer, rightHand, itemDef);

    spellCastArgs.callbacks?.emit({
      type: GameServerResponse.SendAlert,
      title: 'Gemsense',
      content: identMsg,
      extraData: {
        itemName: rightHand.name,
        displayItemSprite: itemDef.sprite,
      },
    });

    this.sendMessage(caster, { message: identMsg });
  }
}
