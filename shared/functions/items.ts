import { IItem, IPlayer, ISimpleItem, ItemClass, Skill, Stat } from '../interfaces';

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

  if (item.name.includes('Rune Scroll') || item.name.includes('Recipe Book')) return true;

  if (itemClass === ItemClass.Box) return true;
  if (itemClass === ItemClass.Book) return true;
  if (useEffect && useEffect.uses) return true;
  if (succorInfo) return true;
  if (ounces > 0 && itemClass !== ItemClass.Rock) return true;

  return false;
}

export function descTextFor(
  player: IPlayer, item: ISimpleItem, itemDef: IItem, encrustDef?: IItem, identifyTier = 0, thiefTier = 0
): string {

  const itemClass = getProp(item, itemDef, 'itemClass');

  // get the number of stars before the desc
  const quality = getProp(item, itemDef, 'quality') ?? 0;
  const starText = quality - 2 > 0 ? Array(quality - 2).fill('★').join('') : '';

  // whether the item has an implicit sell price or not
  const isValuableText = itemDef.sellValue ? 'It looks valuable. ' : '';

  const trapSetText = itemClass === ItemClass.TrapSet ? 'This trap is live. ' : '';

  // the owner text
  let ownedText = '';
  if (item.mods.owner) {
    if (item.mods.owner === player.username) ownedText = 'This item belongs to you. ';
    else                                     ownedText = 'This item does NOT belong to you. ';
  }

  // the crafter
  const craftedText = item.mods.craftedBy ? `This item was made by ${item.mods.craftedBy}. ` : '';

  // how full it is, if at all
  const ounces = item.mods.ounces ?? itemDef.ounces ?? 0;
  let fluidText = itemClass === ItemClass.Bottle && ounces > 0 ? `It is filled with ${ounces} oz of fluid. ` : '';
  if (itemClass === ItemClass.Bottle && ounces === 0) fluidText = 'It is empty.';

  // the items 'use' effect situation
  let usesText = usesString(item, itemDef);
  usesText = usesText ? `The item ${usesText}. ` : '';

  const extendedDesc = getProp(item, itemDef, 'extendedDesc');
  const sense1Text = identifyTier > 0 && extendedDesc ? `This item is ${extendedDesc}. ` : '';

  const stats = getProp(item, itemDef, 'stats');
  const sense1AfterText = identifyTier > 0 && (stats.offense || stats.defense)
    ? `The combat adds are ${stats.offense || 0}/${stats.defense || 0}. ` : '';

  const allStats = [
    Stat.STR, Stat.DEX, Stat.AGI, Stat.WIS, Stat.INT, Stat.WIL, Stat.CHA, Stat.CON, Stat.LUK, Stat.HP, Stat.MP
  ];
  const affectsAttributes = allStats.some(x => stats?.[x]);

  const statsText = identifyTier > 0 && affectsAttributes
    ? 'This item affects physical attributes! ' : '';

  const formatStatForDisplay = (stat: Stat, statValue: number) => {
    const sign = statValue > 0 ? '+' : '';
    const displayValue = statValue % 1 === 0 ? statValue : `${(statValue * 100).toFixed(0)}%`;

    return `${sign}${displayValue} ${stat.toUpperCase()}`;
  };

  const affectedStats = Object.values(Stat).filter(x => stats?.[x]);
  const statSpecificText = identifyTier > 2 && affectedStats.length > 0
    ? `This item affects your stats! ${affectedStats.map(x => `${formatStatForDisplay(x, stats[x])}`).join(', ')}. ` : '';

  const tier = getProp(item, itemDef, 'tier');
  const tierText = identifyTier > 2 && tier > 0 ? `This item is tier ${tier}. ` : '';

  const useEffect = getProp(item, itemDef, 'useEffect');
  const strikeEffect = getProp(item, itemDef, 'strikeEffect');

  let sense2Text = '';
  if (identifyTier > 1 && itemClass !== ItemClass.Bottle && (useEffect || strikeEffect)) {
    sense2Text = `This item has ${useEffect ? 'castable' : 'on-contact'} ${(useEffect || strikeEffect).name}.`;
    sense2Text = (useEffect || strikeEffect).potency
      ? `${sense2Text} with a potency of ${(useEffect || strikeEffect).potency}. ` : `${sense2Text}. `;
  }

  // display the number of upgrades an item has/available
  const maxUpgrades = getProp(item, itemDef, 'maxUpgrades');
  const upgrades = getProp(item, itemDef, 'upgrades');

  const upgradeText = (maxUpgrades > 0 || upgrades?.length > 0)
    ? `It has ${maxUpgrades} magical slot(s), ${upgrades?.length ?? 0} of which are taken. ` : '';

  // various requirements for the item
  const requirements = getProp(item, itemDef, 'requirements');
  const levelText = requirements && requirements.level ? `You must be level ${requirements.level} to use this item. ` : '';

  const alignmentText = requirements && requirements.alignment ? `This item is ${requirements.alignment}. ` : '';

  const formattedSkill = requirements?.skill?.name === Skill.Wand ? 'Magical Weapons' : requirements?.skill?.name;
  const skillText = requirements && requirements.skill ? `This item requires ${formattedSkill} skill ${requirements.skill.level}. ` : '';

  const encrustText = encrustDef ? ` set with ${encrustDef.desc}` : '';

  let desc = getProp(item, itemDef, 'desc');

  const value = getProp(item, itemDef, 'value');
  if (itemClass === ItemClass.Coin) {
    desc = `${value.toLocaleString()} ${desc}`;
  }

  const ozText = itemClass !== ItemClass.Bottle && ounces > 0 ? `${ounces} oz of ` : '';
  const baseText = `You are looking at ${ozText}${desc}${encrustText}. `;

  const pages = getProp(item, itemDef, 'bookPages');
  let pagesText = '';
  if (itemClass === ItemClass.Book) {
    pagesText = `The book has ${pages?.length ?? 0} page(s) in it. `;
  }

  const trait = getProp(item, itemDef, 'trait');
  const levelStrings = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
  const traitText = identifyTier > 0 && trait ? `This item is inscribed with the rune "${trait.name} ${levelStrings[trait.level]}". ` : '';

  const appraiseText = thiefTier > 0 ? `The item is worth ${value.toLocaleString()} gold. ` : '';

  const conditionText = `The item is in ${conditionString(item)} condition. `;

  // whether it can be used in either hand
  const dualWieldText = getProp(item, itemDef, 'offhand') ? 'The item is lightweight enough to use in either hand. ' : '';

  return `${starText} ${baseText}${upgradeText}${isValuableText}${sense1Text}${sense1AfterText}${sense2Text}${tierText}${statsText}
  ${statSpecificText}${dualWieldText}${traitText}${usesText}${fluidText}${levelText}${alignmentText}${skillText}${appraiseText}
  ${pagesText}${trapSetText}${craftedText}${conditionText}${ownedText}`;
}
