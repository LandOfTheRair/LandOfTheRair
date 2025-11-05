import { getSkillLevel } from '@lotr/characters';
import { itemPropertyGet, traitLevelValue } from '@lotr/content';
import { worldGetMapAndState } from '@lotr/core';
import type { ICharacter, IGroundItem, SpellCastArgs } from '@lotr/interfaces';
import { ItemClass, Skill } from '@lotr/interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Transmute extends Spell {
  override getPotency(caster: ICharacter | undefined) {
    return caster
      ? Math.max(
          getSkillLevel(caster, Skill.Thievery),
          getSkillLevel(caster, Skill.Conjuration),
        ) + 10
      : 10;
  }

  override cast(
    caster: ICharacter | undefined,
    target: ICharacter | undefined,
    spellCastArgs: SpellCastArgs,
  ): void {
    const baseCenter = {
      x: spellCastArgs.x ?? 0,
      y: spellCastArgs.y ?? 0,
      map: spellCastArgs.map ?? '',
    };

    const center = target ? target : baseCenter;
    const potency =
      spellCastArgs.potency +
      (caster ? traitLevelValue(caster, 'PhilosophersStone') : 0);

    const mapData = worldGetMapAndState(center.map);
    if (!mapData) return;

    const items = mapData.state?.getEntireGround(center.x, center.y);
    if (!items) return;

    const removeItems: IGroundItem[] = [];
    let totalGold = 0;

    Object.keys(items).forEach((itemClass) => {
      if (removeItems.length > 100) return;

      if (itemClass === ItemClass.Coin || itemClass === ItemClass.Corpse) {
        return;
      }

      items[itemClass].forEach((groundItem: IGroundItem) => {
        if (groundItem.item.mods.owner) return;

        const ounces = itemPropertyGet(groundItem.item, 'ounces') ?? 0;
        if (itemClass === ItemClass.Bottle && ounces > 0) return;

        const quality = itemPropertyGet(groundItem.item, 'quality') ?? 0;
        if (quality > 0) return;

        removeItems.push(groundItem);

        const value = this.game.inventoryHelper.itemValue(
          caster,
          groundItem.item,
        );
        totalGold += value * (groundItem.count ?? 1);
      });
    });

    if (caster && (totalGold === 0 || removeItems.length === 0)) {
      this.sendMessage(caster, {
        message: 'You do not see any items here to transmute.',
      });
      return;
    }

    totalGold *= potency / 100;

    const goldItem = this.game.itemCreator.getGold(totalGold);
    mapData.state?.removeItemsFromGround(center.x, center.y, removeItems);
    mapData.state?.addItemToGround(center.x, center.y, goldItem);

    this.game.messageHelper.sendLogMessageToRadius(center, 4, {
      message: 'You hear the clinking of coins.',
    });
  }
}
