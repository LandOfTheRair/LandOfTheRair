import { descTextFor, GameServerResponse, ICharacter, IPlayer, ItemSlot, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Identify extends Spell {

  cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (!rightHand) {
      this.sendMessage(caster, { message: 'You do not have anything in your right hand!' });
      return;
    }

    const identMsg = descTextFor(caster as IPlayer, rightHand, this.game.itemHelper.getItemDefinition(rightHand.name));

    spellCastArgs.callbacks.emit({
      type: GameServerResponse.SendAlert,
      title: `Identify`,
      content: identMsg,
      extraData: { itemName: rightHand.name },
    });

    this.sendMessage(caster, { message: identMsg });
  }

}
