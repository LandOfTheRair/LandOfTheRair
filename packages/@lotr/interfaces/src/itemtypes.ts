import { ItemSlot } from './building-blocks';

export type DamageType =
  | 'physical'
  | 'necrotic'
  | 'lightning'
  | 'acid'
  | 'fire'
  | 'ice'
  | 'water'
  | 'energy'
  | 'poison'
  | 'disease'
  | 'sonic'
  | 'blunt'
  | 'sharp';

export const MagicClasses: Record<DamageType, boolean> = {
  physical: false,
  necrotic: true,
  fire: true,
  ice: true,
  lightning: true,
  water: true,
  energy: true,
  poison: true,
  disease: true,
  acid: false,
  sonic: false,
  blunt: false,
  sharp: false,
};

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
  Scaleplate = 'Scaleplate',
  Skull = 'Skull',
  Tunic = 'Tunic',
  Trinket = 'Trinket',
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
  Hands = 'Hands', // this is unique, because it's literally only created for combat
  Key = 'Key',
  Rock = 'Rock',
  Scale = 'Scale',
  Scroll = 'Scroll',
  Trap = 'Trap',
  TrapSet = 'TrapSet',
  Twig = 'Twig',
}

export type ItemClass = WeaponClass | ArmorClass | MiscClass;
export const ItemClass = Object.assign({}, WeaponClass, ArmorClass, MiscClass);

export type ItemClassType = `${ItemClass}`;

export const AmmoClasses = [ItemClass.Arrow, ItemClass.Wand];

export const TrinketClasses = [ItemClass.Trinket];

export const SharpWeaponClasses = {
  [ItemClass.Axe]: true,
  [ItemClass.Blunderbuss]: true,
  [ItemClass.Broadsword]: true,
  [ItemClass.Crossbow]: true,
  [ItemClass.Dagger]: true,
  [ItemClass.Greataxe]: true,
  [ItemClass.Greatsword]: true,
  [ItemClass.Halberd]: true,
  [ItemClass.Longbow]: true,
  [ItemClass.Longsword]: true,
  [ItemClass.Shortbow]: true,
  [ItemClass.Shortsword]: true,
  [ItemClass.Spear]: true,
};

export const WeaponClasses = Object.values(WeaponClass);

export const ShieldClasses = [ItemClass.Shield, ItemClass.Saucer];

export const ArmorClasses = [
  ItemClass.Tunic,
  ItemClass.Breastplate,
  ItemClass.Fur,
  ItemClass.Fullplate,
  ItemClass.Scaleplate,
];

export const RobeClasses = [ItemClass.Cloak, ItemClass.Robe];

export const HeadClasses = [
  ItemClass.Hat,
  ItemClass.Helm,
  ItemClass.Skull,
  ItemClass.Saucer,
];

export const NeckClasses = [ItemClass.Amulet];

export const WaistClasses = [ItemClass.Sash];

export const WristsClasses = [ItemClass.Bracers];

export const RingClasses = [ItemClass.Ring];

export const FeetClasses = [ItemClass.Boots];

export const HandsClasses = [
  ItemClass.Gloves,
  ItemClass.Claws,
  ItemClass.Hands,
];

export const EarClasses = [ItemClass.Earring];

export const PotionClasses = [ItemClass.Bottle];

export const EquipHash: Partial<
  Record<ArmorClass | WeaponClass | MiscClass, ItemSlot>
> = {};

ArmorClasses.forEach((t) => (EquipHash[t] = ItemSlot.Armor));
RobeClasses.forEach((t) => (EquipHash[t] = ItemSlot.Robe));
HeadClasses.forEach((t) => (EquipHash[t] = ItemSlot.Head));
NeckClasses.forEach((t) => (EquipHash[t] = ItemSlot.Neck));
WaistClasses.forEach((t) => (EquipHash[t] = ItemSlot.Waist));
WristsClasses.forEach((t) => (EquipHash[t] = ItemSlot.Wrists));
RingClasses.forEach((t) => (EquipHash[t] = ItemSlot.Ring));
FeetClasses.forEach((t) => (EquipHash[t] = ItemSlot.Feet));
HandsClasses.forEach((t) => (EquipHash[t] = ItemSlot.Hands));
EarClasses.forEach((t) => (EquipHash[t] = ItemSlot.Ear));
PotionClasses.forEach((t) => (EquipHash[t] = ItemSlot.Potion));
AmmoClasses.forEach((t) => (EquipHash[t] = ItemSlot.Ammo));
TrinketClasses.forEach((t) => (EquipHash[t] = ItemSlot.Trinket));

export const GivesBonusInHandItemClasses = [
  ...Object.keys(WeaponClass),
  ...NeckClasses,
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
  ...EarClasses,
  ...TrinketClasses,
];

export const EquippableItemClassesWithWeapons = [
  ...Object.keys(WeaponClass),
  ...AmmoClasses,
];
