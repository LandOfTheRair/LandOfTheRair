import { foodTextFor } from '../../../../helpers';
import {
  GameServerResponse,
  ICharacter,
  IPlayer,
  ItemClass,
  ItemSlot,
  SpellCastArgs,
} from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Foodsense extends Spell {
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

    const { itemClass, useEffect } = this.game.itemHelper.getItemProperties(
      rightHand,
      ['itemClass', 'useEffect'],
    );

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
      this.game.itemHelper.getItemDefinition(rightHand.name),
    );

    spellCastArgs.callbacks?.emit({
      type: GameServerResponse.SendAlert,
      title: 'Foodsense',
      content: identMsg,
      extraData: {
        itemName: rightHand.name,
        displayItemSprite: this.game.itemHelper.getItemProperty(
          rightHand,
          'sprite',
        ),
      },
    });

    this.sendMessage(caster, { message: identMsg });
  }
}
