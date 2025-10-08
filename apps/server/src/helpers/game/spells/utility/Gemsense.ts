import { itemGet, itemPropertiesGet } from '@lotr/content';
import type { ICharacter, IPlayer, SpellCastArgs } from '@lotr/interfaces';
import { GameServerResponse, ItemClass, ItemSlot } from '@lotr/interfaces';
import { gemTextFor } from '@lotr/shared';
import { Spell } from '../../../../models/world/Spell';

export class Gemsense extends Spell {
  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
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

    const { itemClass, encrustItem } = itemPropertiesGet(rightHand, [
      'itemClass',
      'encrustItem',
    ]);

    if (!encrustItem && itemClass !== ItemClass.Gem) {
      this.sendMessage(caster, {
        message: 'You do not have a gem or encrusted item in your right hand!',
      });
      return;
    }

    const itemDef = itemGet(encrustItem || rightHand.name)!;

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
