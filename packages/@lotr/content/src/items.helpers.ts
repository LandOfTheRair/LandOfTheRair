import { ItemClass, Skill } from '@lotr/interfaces';

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
