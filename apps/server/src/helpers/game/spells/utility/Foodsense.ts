import { itemGet, itemPropertiesGet, itemPropertyGet } from '@lotr/content';
import type { ICharacter, IPlayer, SpellCastArgs } from '@lotr/interfaces';
import { GameServerResponse, ItemClass, ItemSlot } from '@lotr/interfaces';
import { foodTextFor } from '@lotr/shared';
import { Spell } from '../../../../models/world/Spell';

export class Foodsense extends Spell {
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

    const { itemClass, useEffect } = itemPropertiesGet(rightHand, [
      'itemClass',
      'useEffect',
    ]);

    if (itemClass !== ItemClass.Food) {
      this.sendMessage(caster, {
        message: 'You do not have a food item in your right hand!',
      });
      return;
    }

    if (!useEffect || useEffect.name !== 'Nourishment') {
      this.sendMessage(caster, {
        message: 'You do not have a food item in your right hand!',
      });
      return;
    }

    const identMsg = foodTextFor(
      caster as IPlayer,
      rightHand,
      itemGet(rightHand.name)!,
    );

    spellCastArgs.callbacks?.emit({
      type: GameServerResponse.SendAlert,
      title: 'Foodsense',
      content: identMsg,
      extraData: {
        itemName: rightHand.name,
        displayItemSprite: itemPropertyGet(rightHand, 'sprite'),
      },
    });

    this.sendMessage(caster, { message: identMsg });
  }
}
