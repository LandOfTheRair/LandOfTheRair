import { IItem, IPlayer, ISimpleItem, ItemClass, Skill } from '../interfaces';

function getProp(item: ISimpleItem, itemDef: IItem, prop: keyof IItem): any {
  return item.mods[prop] || itemDef[prop];
}

function conditionString(item: ISimpleItem): string {
  const condition = item.mods.condition ?? 20000;
  if (condition <= 0)     return 'broken';
  if (condition <= 2500)  return 'rough';
  if (condition <= 5000)  return 'tattered';
  if (condition <= 10000) return 'below average';
  if (condition <= 20000) return 'average';
  if (condition <= 30000) return 'above average';
  if (condition <= 40000) return 'mint';
  if (condition <= 50000) return 'above mint';
  if (condition <= 99999) return 'perfect';
  return 'heavenly';
}

function usesString(item: ISimpleItem, itemDef: IItem): string {
  const effect = getProp(item, itemDef, 'useEffect');
  if (!effect || !effect.uses || effect.uses < 0) return '';
  const uses = effect.uses;

  if (uses < 3)    return 'looks brittle';
  if (uses < 9)    return 'looks cracked';
  if (uses < 20)   return 'looks normal';
  if (uses < 50)   return 'surges with energy';
  if (uses < 100)  return 'crackles with power';

  return 'is flawlessly vibrant';

  // the item <x>
}

export function isOwnedBy(player: IPlayer, item: ISimpleItem): boolean {
  return !item.mods.owner || item.mods.owner === player.username;
}

export function canUseItem(player: IPlayer, item: ISimpleItem, itemDef: IItem): boolean {

  const itemClass = getProp(item, itemDef, 'itemClass');
  const useEffect = getProp(item, itemDef, 'useEffect');
  const ounces = getProp(item, itemDef, 'ounces');
  const succorInfo = getProp(item, itemDef, 'succorInfo');

  const condition = item.mods.condition ?? 20000;

  // can't use broken items, traps, or items you don't own
  if (condition <= 0) return false;
  if (itemClass === ItemClass.Trap) return false;
  if (!isOwnedBy(player, item)) return false;

  if (item.name.includes('Rune Scroll')) return true;

  if (itemClass === ItemClass.Box) return true;
  if (itemClass === ItemClass.Book) return true;
  if (useEffect && useEffect.uses) return true;
  if (succorInfo) return true;
  if (ounces > 0) return true;

  return false;
}

export function descTextFor(player: IPlayer, item: ISimpleItem, itemDef: IItem, encrustDef?: IItem, identifyTier = 0, thiefTier = 0): string {

  const itemClass = getProp(item, itemDef, 'itemClass');

  // get the number of stars before the desc
  const quality = getProp(item, itemDef, 'quality') ?? 0;
  const starText = quality - 2 > 0 ? Array(quality - 2).fill('★').join('') : '';

  // whether the item has an implicit sell price or not
  const isValuableText = getProp(item, itemDef, 'sellValue') ? 'It looks valuable. ' : '';

  // the owner text
  let ownedText = '';
  if (item.mods.owner) {
    if (item.mods.owner === player.username) ownedText = 'This item belongs to you. ';
    else                                     ownedText = 'This item does NOT belong to you. ';
  }

  // how full it is, if at all
  const ounces = item.mods.ounces || 0;
  let fluidText = itemClass === ItemClass.Bottle && ounces > 0 ? `It is filled with ${ounces} oz of fluid. ` : '';
  if (itemClass === ItemClass.Bottle && ounces === 0) fluidText = 'It is empty.';

  // the items 'use' effect situation
  let usesText = usesString(item, itemDef);
  usesText = usesText ? `The item ${usesText}. ` : '';

  const extendedDesc = getProp(item, itemDef, 'extendedDesc');
  const sense1Text = identifyTier > 0 && extendedDesc ? `This item is ${extendedDesc}. ` : '';

  const stats = getProp(item, itemDef, 'stats');
  const sense1AfterText = identifyTier > 0 && (stats.offense || stats.defense) ? `The combat adds are ${stats.offense || 0}/${stats.defense || 0}. ` : '';

  const useEffect = getProp(item, itemDef, 'useEffect');
  const strikeEffect = getProp(item, itemDef, 'strikeEffect');

  let sense2Text = '';
  if(identifyTier > 1 && itemClass !== ItemClass.Bottle && (useEffect || strikeEffect)) {
    sense2Text = `This item has ${useEffect ? 'castable' : 'on-contact'} ${(useEffect || strikeEffect).name}.`
    sense2Text = (useEffect || strikeEffect).potency ? `${sense2Text} with a potency of ${(useEffect || strikeEffect).potency}. ` : `${sense2Text}. `;
  }

  // display the number of upgrades an item has/available
  const maxUpgrades = getProp(item, itemDef, 'maxUpgrades');
  const upgrades = getProp(item, itemDef, 'upgrades');

  const upgradeText = (maxUpgrades > 0 || upgrades?.length > 0) ? `It has ${maxUpgrades} carved slot(s), ${upgrades?.length ?? 0} of which are taken. ` : '';

  // various requirements for the item
  const requirements = getProp(item, itemDef, 'requirements');
  const levelText = requirements && requirements.level ? `You must be level ${requirements.level} to use this item. ` : '';

  const alignmentText = requirements && requirements.alignment ? `This item is ${requirements.alignment}. ` : '';

  const formattedSkill = requirements?.skill?.name === Skill.Wand ? 'Magical Weapons' : requirements?.skill?.name;
  const skillText = requirements && requirements.skill ? `This item requires ${formattedSkill} skill ${requirements.skill.level}. ` : '';

  const encrustText = encrustDef ? ` set with ${encrustDef.desc}` : '';

  let desc = getProp(item, itemDef, 'desc');

  const value = getProp(item, itemDef, 'value');
  if(itemClass === ItemClass.Coin) {
    desc = `${value.toLocaleString()} ${desc}`;
  }

  const ozText = itemClass !== ItemClass.Bottle && ounces > 0 ? `${ounces} oz of ` : '';
  const baseText = `You are looking at ${ozText}${desc}${encrustText}. `;

  const appraiseText = thiefTier > 0 ? `The item is worth ${value} gold. ` : '';

  const conditionText = `The item is in ${conditionString(item)} condition. `;

  // whether it can be used in either hand
  const dualWieldText = getProp(item, itemDef, 'offhand') ? 'The item is lightweight enough to use in either hand. ' : '';

  // TODO: expiration

  return `${starText} ${baseText}${upgradeText}${isValuableText}${sense1Text}${sense1AfterText}${sense2Text}
    ${dualWieldText}${usesText}${fluidText}${levelText}${alignmentText}${skillText}
    ${conditionText}${ownedText}${appraiseText}`;
}
