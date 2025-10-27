import { isPlayer } from '@lotr/characters';
import {
  ItemSlot,
  type ICharacter,
  type IStatusEffect,
} from '@lotr/interfaces';
import { sample } from 'lodash';
import { Effect } from '../../../../../models';

export class Corroded extends Effect {
  override tick(char: ICharacter, effect: IStatusEffect) {
    super.tick(char, effect);

    const allEquipment = Object.keys(char.items.equipment)
      .filter(
        (slot) => ![ItemSlot.Potion, ItemSlot.Ammo].includes(slot as ItemSlot),
      )
      .map((i) => char.items.equipment[i as ItemSlot])
      .filter(Boolean)
      .filter((item) => (item?.mods.condition ?? 20000) > 0);

    const itemToDamage = sample(allEquipment);
    if (itemToDamage) {
      const durabilityLoss = isPlayer(char) ? 500 : 2500;
      this.game.itemHelper.loseCondition(itemToDamage, durabilityLoss, char);
    }
  }
}
