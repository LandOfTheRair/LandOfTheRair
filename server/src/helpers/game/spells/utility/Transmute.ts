import {
  ICharacter,
  IGroundItem,
  ItemClass,
  Skill,
  SpellCastArgs,
} from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Transmute extends Spell {
  override getPotency(caster: ICharacter | null) {
    return caster
      ? Math.max(
          this.game.characterHelper.getSkillLevel(caster, Skill.Thievery),
          this.game.characterHelper.getSkillLevel(caster, Skill.Conjuration),
        ) + 10
      : 10;
  }

  override cast(
    caster: ICharacter | null,
    target: ICharacter | null,
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
      (caster
        ? this.game.traitHelper.traitLevelValue(caster, 'PhilosophersStone')
        : 0);

    const mapData = this.game.worldManager.getMap(center.map);
    if (!mapData) return;

    const items = mapData.state.getEntireGround(center.x, center.y);

    const removeItems: IGroundItem[] = [];
    let totalGold = 0;

    Object.keys(items).forEach((itemClass) => {
      if (removeItems.length > 100) return;

      if (itemClass === ItemClass.Coin || itemClass === ItemClass.Corpse) {
        return;
      }

      items[itemClass].forEach((groundItem: IGroundItem) => {
        if (groundItem.item.mods.owner) return;

        const ounces = this.game.itemHelper.getItemProperty(
          groundItem.item,
          'ounces',
        );
        if (itemClass === ItemClass.Bottle && ounces > 0) return;

        const quality = this.game.itemHelper.getItemProperty(
          groundItem.item,
          'quality',
        );
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
    mapData.state.removeItemsFromGround(center.x, center.y, removeItems);
    mapData.state.addItemToGround(center.x, center.y, goldItem);

    this.game.messageHelper.sendLogMessageToRadius(center, 4, {
      message: 'You hear the clinking of coins.',
    });
  }
}
