import { ICharacter, IGroundItem, ItemClass, Skill, SpellCastArgs } from '../../../../interfaces';
import { Spell } from '../../../../models/world/Spell';

export class Transmute extends Spell {

  override getPotency(caster: ICharacter | null) {
    return caster ? this.game.characterHelper.getSkillLevel(caster, Skill.Thievery) + 30 : 10;
  }

  override cast(caster: ICharacter | null, target: ICharacter | null, spellCastArgs: SpellCastArgs): void {
    const center = target ? target : { x: spellCastArgs.x ?? 0, y: spellCastArgs.y ?? 0, map: spellCastArgs.map ?? '' };
    const potency = spellCastArgs.potency;

    const mapData = this.game.worldManager.getMap(center.map);
    if (!mapData) return;

    const items = mapData.state.getEntireGround(center.x, center.y);

    const removeItems: IGroundItem[] = [];
    let totalGold = 0;

    Object.keys(items).forEach(itemClass => {
      if (itemClass === ItemClass.Coin || itemClass === ItemClass.Corpse) return;

      items[itemClass].forEach((groundItem: IGroundItem) => {
        if (groundItem.item.mods.owner) return;

        removeItems.push(groundItem);

        const value = this.game.inventoryHelper.itemValue(caster, groundItem.item);
        totalGold += (value * (groundItem.count ?? 1));
      });
    });

    if (caster && (totalGold === 0 || removeItems.length === 0)) {
      this.sendMessage(caster, { message: 'You do not see any items here to transmute.' });
      return;
    }

    totalGold *= (potency / 100);

    const goldItem = this.game.itemCreator.getGold(totalGold);
    mapData.state.removeItemsFromGround(center.x, center.y, removeItems);
    mapData.state.addItemToGround(center.x, center.y, goldItem);

    this.game.messageHelper.sendLogMessageToRadius(center, 4, { message: 'You hear the clinking of coins.' });
  }

}
