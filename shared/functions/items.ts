import { IItem, IPlayer, ISimpleItem, ItemClass } from '../interfaces';

function getProp(item: ISimpleItem, itemDef: IItem, prop: keyof IItem): any {
  return item.mods[prop] || itemDef[prop];
}

function conditionString(item: ISimpleItem): string {
  const condition = item.mods.condition ?? 20000;
  if(condition <= 0)     return 'broken';
  if(condition <= 2500)  return 'rough';
  if(condition <= 5000)  return 'tattered';
  if(condition <= 10000) return 'below average';
  if(condition <= 20000) return 'average';
  if(condition <= 30000) return 'above average';
  if(condition <= 40000) return 'mint';
  if(condition <= 50000) return 'above mint';
  if(condition <= 99999) return 'perfect';
  return 'heavenly';
}

function usesString(item: ISimpleItem, itemDef: IItem): string {
  const effect = getProp(item, itemDef, 'useEffect')
  if(!effect || !effect.uses || effect.uses < 0) return '';
  const uses = effect.uses;

  if(uses < 3)    return 'looks brittle';
  if(uses < 9)    return 'looks cracked';
  if(uses < 20)   return 'looks normal';
  if(uses < 50)   return 'surges with energy';
  if(uses < 100)  return 'crackles with power';

  return 'is flawlessly vibrant';

  // the item <x>
}

export function descTextFor(player: IPlayer, item: ISimpleItem, itemDef: IItem): string {

  const itemClass = getProp(item, itemDef, 'itemClass');

  // get the number of stars before the desc
  const quality = getProp(item, itemDef, 'quality') ?? 0;
  const starText = quality - 2 > 0 ? Array(quality - 2).fill('★').join('') : '';

  // whether the item has an implicit sell price or not
  const isValuableText = getProp(item, itemDef, 'sellValue') ? 'It looks valuable. ' : '';

  // the owner text
  let ownedText = '';
  if(item.mods.owner) {
    if(item.mods.owner === player.username) ownedText = 'This item belongs to you. ';
    else                                    ownedText = 'This item does NOT belong to you. ';
  }

  // how full it is, if at all
  const ounces = item.mods.ounces || 0;
  let fluidText = itemClass === ItemClass.Bottle && ounces > 0 ? `It is filled with ${ounces}oz of fluid. ` : '';
  if(itemClass === ItemClass.Bottle && ounces === 0) fluidText = 'It is empty.';

  // the items 'use' effect situation
  let usesText = usesString(item, itemDef);
  usesText = usesText ? `The item ${usesText}. ` : '';

  // TODO: sense level 1
  // TODO: sense level 2

  // various requirements for the item
  const requirements = getProp(item, itemDef, 'requirements');
  const levelText = requirements && requirements.level ? `You must be level ${requirements.level} to use this item. ` : '';
  
  const alignmentText = requirements && requirements.alignment ? `This item is ${requirements.alignment}. ` : '';

  const formattedSkill = requirements?.skill?.name === 'Wand' ? 'Magical Weapons' : requirements?.skill?.name;
  const skillText = requirements && requirements.skill ? `This item requires ${formattedSkill} skill ${requirements.skill.level}. ` : '';

  // TODO: encrust

  const desc = getProp(item, itemDef, 'desc');
  
  const ozText = itemClass !== ItemClass.Bottle && ounces > 0 ? `${ounces}oz of ` : '';
  const baseText = `You are looking at ${ozText}${desc}. `;

  const conditionText = `The item is in ${conditionString(item)} condition. `;

  // whether it can be used in either hand
  const dualWieldText = getProp(item, itemDef, 'offhand') ? 'The item is lightweight enough to use in either hand. ' : '';

  // TODO: expiration
  // TODO: appraise
  // TODO: stat boosts for thief/mage skill

  return `${starText} ${baseText}${isValuableText}
    ${dualWieldText}${usesText}${fluidText}${levelText}${alignmentText}${skillText}
    ${conditionText}${ownedText}`;
}