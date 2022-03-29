import { BaseClass, descTextFor, GameServerResponse, ICharacter, IPlayer, ItemSlot, Skill, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Identify extends Spell {

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    if (!caster) return;

    const rightHand = caster?.items.equipment[ItemSlot.RightHand];
    if (!rightHand) {
      this.sendMessage(caster, { message: 'You do not have anything in your right hand!' });
      return;
    }

    const conjSkillLevel = this.game.calculatorHelper.calcSkillLevelForCharacter(caster, Skill.Conjuration);
    let castTier = 0;
    if (conjSkillLevel >= 10) castTier = 1;
    if (conjSkillLevel >= 20) castTier = 2;

    if (this.game.traitHelper.traitLevel(caster, 'ExpansiveKnowledge')) castTier = 3;

    const thiefTier = this.game.traitHelper.traitLevel(caster, 'Appraise') ? 1 : 0;

    const identMsg = descTextFor(
      caster as IPlayer,
      rightHand,
      this.game.itemHelper.getItemDefinition(rightHand.name),
      rightHand.mods?.encrustItem ? this.game.itemHelper.getItemDefinition(rightHand.mods.encrustItem) : undefined,
      castTier,
      caster.baseClass === BaseClass.Thief ? thiefTier : 0
    );

    this.game.itemHelper.markIdentified(rightHand, castTier);

    spellCastArgs.callbacks?.emit({
      type: GameServerResponse.SendAlert,
      title: 'Identify',
      content: identMsg,
      extraData: { itemName: rightHand.name, displayItemSprite: this.game.itemHelper.getItemProperty(rightHand, 'sprite') },
    });

    this.sendMessage(caster, { message: identMsg });
  }

}
