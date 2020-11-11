import { ItemSlot } from './building-blocks';

export type DamageType =
  'physical'
| 'necrotic'
| 'fire'
| 'ice'
| 'water'
| 'energy'
| 'poison'
| 'disease';

export enum WeaponClass {
  Arrow = 'Arrow',
  Axe = 'Axe',
  Blunderbuss = 'Blunderbuss',
  Broadsword = 'Broadsword',
  Club = 'Club',
  Crossbow = 'Crossbow',
  Dagger = 'Dagger',
  Flail = 'Flail',
  Greataxe = 'Greataxe',
  Greatmace = 'Greatmace',
  Greatsword = 'Greatsword',
  Halberd = 'Halberd',
  Hammer = 'Hammer',
  Longbow = 'Longbow',
  Longsword = 'Longsword',
  Mace = 'Mace',
  Saucer = 'Saucer',
  Shield = 'Shield',
  Shortbow = 'Shortbow',
  Shortsword = 'Shortsword',
  Spear = 'Spear',
  Staff = 'Staff',
  Sword = 'Sword',
  Throwing = 'Throwing',
  Totem = 'Totem',
  TwoHanded = 'TwoHanded',
  Wand = 'Wand',
}

export enum ArmorClass {
  Amulet = 'Amulet',
  Bracers = 'Bracers',
  Boots = 'Boots',
  Breastplate = 'Breastplate',
  Claws = 'Claws',
  Cloak = 'Cloak',
  Earring = 'Earring',
  Fullplate = 'Fullplate',
  Fur = 'Fur',
  Gloves = 'Gloves',
  Hat = 'Hat',
  Helm = 'Helm',
  Robe = 'Robe',
  Ring = 'Ring',
  Sash = 'Sash',
  Skull = 'Skull',
  Scaleplate = 'Scaleplate',
  Tunic = 'Tunic',
}

export enum MiscClass {
  Book = 'Book',
  Bottle = 'Bottle',
  Box = 'Box',
  Coin = 'Coin',
  Corpse = 'Corpse',
  Flower = 'Flower',
  Food = 'Food',
  Gem = 'Gem',
  Key = 'Key',
  Rock = 'Rock',
  Scroll = 'Scroll',
  Trap = 'Trap',
  Twig = 'Twig'
}

export const ItemClass = Object.assign({}, WeaponClass, ArmorClass, MiscClass);

export const AmmoClasses = [ItemClass.Arrow];

export const SharpWeaponClasses = [
  ItemClass.Axe, ItemClass.Blunderbuss, ItemClass.Broadsword, ItemClass.Crossbow, ItemClass.Dagger,
  ItemClass.Greataxe, ItemClass.Greatsword, ItemClass.Halberd, ItemClass.Longbow, ItemClass.Longsword,
  ItemClass.Shortbow, ItemClass.Shortsword, ItemClass.Spear
];

export const ShieldClasses = [ItemClass.Shield, ItemClass.Saucer];

export const ArmorClasses = [ItemClass.Tunic, ItemClass.Breastplate, ItemClass.Fur, ItemClass.Fullplate, ItemClass.Scaleplate];

export const RobeClasses = [ItemClass.Cloak, ItemClass.Robe];

export const HeadClasses = [ItemClass.Hat, ItemClass.Helm, ItemClass.Skull, ItemClass.Saucer];

export const NeckClasses = [ItemClass.Amulet];

export const WaistClasses = [ItemClass.Sash];

export const WristsClasses = [ItemClass.Bracers];

export const RingClasses = [ItemClass.Ring];

export const FeetClasses = [ItemClass.Boots];

export const HandsClasses = [ItemClass.Gloves, ItemClass.Claws];

export const EarClasses = [ItemClass.Earring];

export const PotionClasses = [ItemClass.Bottle];

export const EquipHash: Partial<Record<ArmorClass, ItemSlot>> = {};
ArmorClasses.forEach(t => EquipHash[t] = ItemSlot.Armor);
RobeClasses.forEach(t => EquipHash[t] = ItemSlot.Robe);
HeadClasses.forEach(t => EquipHash[t] = ItemSlot.Head);
NeckClasses.forEach(t => EquipHash[t] = ItemSlot.Neck);
WaistClasses.forEach(t => EquipHash[t] = ItemSlot.Waist);
WristsClasses.forEach(t => EquipHash[t] = ItemSlot.Wrists);
RingClasses.forEach(t => EquipHash[t] = ItemSlot.Ring);
FeetClasses.forEach(t => EquipHash[t] = ItemSlot.Feet);
HandsClasses.forEach(t => EquipHash[t] = ItemSlot.Hands);
EarClasses.forEach(t => EquipHash[t] = ItemSlot.Ear);
PotionClasses.forEach(t => EquipHash[t] = ItemSlot.Potion);
AmmoClasses.forEach(t => EquipHash[t] = ItemSlot.Ammo);

export const GivesBonusInHandItemClasses = [
  ...Object.keys(WeaponClass),
  ...NeckClasses,
  ...AmmoClasses
];

export const CanUseEffectItemClasses = [
  ...Object.keys(WeaponClass),
  ...HandsClasses,
  ...AmmoClasses,
  ...FeetClasses
];

export const EquippableItemClasses = [
  ...ArmorClasses,
  ...RobeClasses,
  ...HeadClasses,
  ...NeckClasses,
  ...WaistClasses,
  ...WristsClasses,
  ...RingClasses,
  ...FeetClasses,
  ...HandsClasses,
  ...EarClasses
];

export const EquippableItemClassesWithWeapons = [
  ...Object.keys(WeaponClass),
  ...AmmoClasses
];
