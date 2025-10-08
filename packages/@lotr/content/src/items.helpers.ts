import type { ISimpleItem } from '@lotr/interfaces';
import { ItemClass, ShieldClasses, Skill } from '@lotr/interfaces';
import { itemPropertyGet } from './items.properties';

export function getHandsItem() {
  return {
    name: 'hands',
    uuid: 'hands',
    mods: {
      itemClass: ItemClass.Hands,
      type: Skill.Martial,
      tier: 1,
      condition: 20000,
    },
  };
}

export function isShield(item: ISimpleItem) {
  const itemClass = itemPropertyGet(item, 'itemClass');
  return ShieldClasses.includes(itemClass);
}
