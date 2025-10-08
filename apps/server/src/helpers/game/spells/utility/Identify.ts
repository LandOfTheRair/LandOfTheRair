import {
  itemGet,
  itemPropertyGet,
  settingClassConfigGet,
  traitLevel,
} from '@lotr/content';
import { calcSkillLevelForCharacter } from '@lotr/exp';
import type { ICharacter, IPlayer, SpellCastArgs } from '@lotr/interfaces';
import { GameServerResponse, ItemSlot, Skill } from '@lotr/interfaces';
import { descTextFor } from '@lotr/shared';
import { Spell } from '../../../../models/world/Spell';

export class Identify extends Spell {
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

    const conjSkillLevel = calcSkillLevelForCharacter(
      caster,
      Skill.Conjuration,
    );
    let castTier = 0;
    if (conjSkillLevel >= 10) castTier = 1;
    if (conjSkillLevel >= 20) castTier = 2;

    if (traitLevel(caster, 'ExpansiveKnowledge')) {
      castTier = 3;
    }

    const thiefTier = traitLevel(caster, 'Appraise') ? 1 : 0;

    const canAppraiseWhileIdentifying =
      settingClassConfigGet<'canAppraiseWhileIdentifying'>(
        caster.baseClass,
        'canAppraiseWhileIdentifying',
      );

    const identMsg = descTextFor(
      caster as IPlayer,
      rightHand,
      itemGet(rightHand.name)!,
      rightHand.mods?.encrustItem
        ? itemGet(rightHand.mods.encrustItem)
        : undefined,
      castTier,
      canAppraiseWhileIdentifying ? thiefTier : 0,
    );

    this.game.itemHelper.markIdentified(rightHand, castTier);

    spellCastArgs.callbacks?.emit({
      type: GameServerResponse.SendAlert,
      title: 'Identify',
      content: identMsg,
      extraData: {
        itemName: rightHand.name,
        displayItemSprite: itemPropertyGet(rightHand, 'sprite'),
      },
    });

    this.sendMessage(caster, { message: identMsg });
  }
}
