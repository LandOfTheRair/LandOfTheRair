import {
  IItem,
  IPlayer,
  ISimpleItem,
  ItemClass,
  Skill,
  Stat,
} from '../interfaces';

const formatStatForDisplay = (stat: Stat, statValue: number) => {
  const sign = statValue > 0 ? '+' : '';
  const isPercent = stat.includes('Percent');
  const displayValue = isPercent ? `${statValue}%` : statValue;
  const statName = stat.replace('Percent', '');

  return `${sign}${displayValue} ${statName.toUpperCase()}`;
};

function getProp(item: ISimpleItem, itemDef: IItem, prop: keyof IItem): any {
  return item.mods[prop] || itemDef[prop];
}

function conditionString(item: ISimpleItem): string {
  const condition = item.mods.condition ?? 20000;
  if (condition <= 0) return 'broken';
  if (condition <= 2500) return 'rough';
  if (condition <= 5000) return 'tattered';
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

  if (uses < 3) return 'looks brittle';
  if (uses < 9) return 'looks cracked';
  if (uses < 20) return 'looks normal';
  if (uses < 50) return 'surges with energy';
  if (uses < 100) return 'crackles with power';

  return 'is flawlessly vibrant';

  // the item <x>
}

export function isOwnedBy(player: IPlayer, item: ISimpleItem): boolean {
  return !item.mods || !item.mods.owner || item.mods.owner === player.username;
}

export function canUseItem(
  player: IPlayer,
  item: ISimpleItem,
  itemDef: IItem,
): boolean {
  const itemClass = getProp(item, itemDef, 'itemClass');
  const useEffect = getProp(item, itemDef, 'useEffect');
  const ounces = getProp(item, itemDef, 'ounces');
  const succorInfo = getProp(item, itemDef, 'succorInfo');

  const condition = item.mods.condition ?? 20000;

  // can't use broken items, traps, or items you don't own
  if (condition <= 0) return false;
  if (itemClass === ItemClass.Trap) return false;
  if (!isOwnedBy(player, item)) return false;

  if (item.name.includes('Rune Scroll') || item.name.includes('Recipe Book')) {
    return true;
  }

  if (itemClass === ItemClass.Box) return true;
  if (itemClass === ItemClass.Book) return true;
  if (useEffect && useEffect.uses) return true;
  if (succorInfo) return true;
  if (ounces > 0 && itemClass !== ItemClass.Rock) return true;

  return false;
}

export function descTextFor(
  player: IPlayer,
  item: ISimpleItem,
  itemDef: IItem,
  encrustDef?: IItem,
  castIdentifyTier = 0,
  thiefTier = 0,
): string {
  if (!item || !itemDef) {
    return 'This description cannot be generated at this time.';
  }

  const quality = getProp(item, itemDef, 'quality') ?? 0;
  const value = getProp(item, itemDef, 'value');
  const extendedDesc = getProp(item, itemDef, 'extendedDesc');
  const maxUpgrades = getProp(item, itemDef, 'maxUpgrades');
  const upgrades = getProp(item, itemDef, 'upgrades');
  const isOffhand = getProp(item, itemDef, 'offhand');
  const useEffect = getProp(item, itemDef, 'useEffect');
  const strikeEffect = getProp(item, itemDef, 'strikeEffect');
  const tier = getProp(item, itemDef, 'tier');
  const trait = getProp(item, itemDef, 'trait');
  const requirements = getProp(item, itemDef, 'requirements');
  const pages = getProp(item, itemDef, 'bookPages');
  const usesText = usesString(item, itemDef);

  // calculating stats is more than getting a prop unfortunately
  const baseStats = itemDef.stats ?? {};
  const modStats = item.mods?.stats ?? {};
  const stats: Partial<Record<Stat, number>> = {};

  for (const stat of Object.keys(baseStats)) {
    const baseStat = baseStats[stat];

    stats[stat] ??= 0;
    stats[stat] += baseStat;
  }

  for (const stat of Object.keys(modStats)) {
    const baseStat = modStats[stat];

    stats[stat] ??= 0;
    stats[stat] += baseStat;
  }

  const allStats = [
    Stat.STR,
    Stat.DEX,
    Stat.AGI,
    Stat.WIS,
    Stat.INT,
    Stat.WIL,
    Stat.CHA,
    Stat.CON,
    Stat.LUK,
    Stat.HP,
    Stat.MP,
  ];

  const affectsAttributes = allStats.some((x) => stats?.[x]);
  const affectedStats = Object.values(Stat).filter((x) => stats?.[x]);

  const levelStrings = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

  const allTexts: string[] = [];

  const identifyTier = Math.max(castIdentifyTier, item.mods.identifyTier ?? 0);
  const itemClass = getProp(item, itemDef, 'itemClass');

  // get the number of stars before the desc
  if (quality - 2 > 0) {
    allTexts.push(
      Array(quality - 2)
        .fill('★')
        .join(''),
    );
  }

  // the base text of the item
  const ounces = item.mods.ounces ?? itemDef.ounces ?? 0;
  const encrustText = encrustDef ? ` set with ${encrustDef.desc}` : '';

  let desc = getProp(item, itemDef, 'desc');

  if (itemClass === ItemClass.Coin) {
    desc = `${value.toLocaleString()} ${desc}`;
  }

  const ozText =
    itemClass !== ItemClass.Bottle && ounces > 0 ? `${ounces} oz of ` : '';
  allTexts.push(`You are looking at ${ozText}${desc}${encrustText}.`);

  // display the number of upgrades an item has/available

  if (maxUpgrades > 0 || upgrades?.length > 0) {
    allTexts.push(
      `It has ${maxUpgrades} magical slot(s), ${
        upgrades?.length ?? 0
      } of which are taken.`,
    );
  }

  // whether the item has an implicit sell price or not
  if (itemDef.sellValue || thiefTier > 0) {
    if (thiefTier > 0) {
      allTexts.push(`The item is worth ${value.toLocaleString()} gold.`);
    } else {
      allTexts.push('It looks valuable.');
    }
  }

  if (identifyTier > 0 && extendedDesc) {
    allTexts.push(`This item is ${extendedDesc}.`);
  }

  if (identifyTier > 0 && (stats.offense || stats.defense)) {
    allTexts.push(
      `The combat adds are ${stats.offense || 0}/${stats.defense || 0}.`,
    );
  }

  if (
    identifyTier > 1 &&
    itemClass !== ItemClass.Bottle &&
    (useEffect || strikeEffect)
  ) {
    let sense2Text = '';

    sense2Text = `This item has ${useEffect ? 'castable' : 'on-contact'} ${
      (useEffect || strikeEffect).name
    }.`;

    if ((useEffect || strikeEffect).potency) {
      sense2Text = `${sense2Text} with a potency of ${
        (useEffect || strikeEffect).potency
      }.`;
    } else {
      sense2Text = `${sense2Text}.`;
    }
    allTexts.push(sense2Text);
  }
  if (identifyTier > 2 && tier > 0) {
    allTexts.push(`This item is tier ${tier}.`);
  }

  if (identifyTier > 0 && affectsAttributes) {
    allTexts.push('This item affects physical attributes!');
  }

  if (identifyTier > 2 && affectedStats.length > 0) {
    allTexts.push(
      `This item affects your stats! ${affectedStats
        .map((x) => `${formatStatForDisplay(x, stats[x] ?? 0)}`)
        .join(', ')}. `,
    );
  }

  // whether it can be used in either hand
  if (isOffhand) {
    allTexts.push('The item is lightweight enough to use in either hand.');
  }

  // trait text
  const traitLevelText = `${trait?.name}${
    levelStrings[trait?.level] ? levelStrings[trait?.level] + ' ' : ''
  }`;

  if (identifyTier > 0 && trait?.name) {
    allTexts.push(`This item is inscribed with the rune "${traitLevelText}".`);
  }

  // the items 'use' effect situation
  if (usesText) {
    allTexts.push(`The item ${usesText}.`);
  }

  // how full it is, if at all
  if (itemClass === ItemClass.Bottle && ounces > 0) {
    allTexts.push(`It is filled with ${ounces} oz of fluid.`);
  }

  if (itemClass === ItemClass.Bottle && ounces === 0) {
    allTexts.push('It is empty.');
  }

  if (itemClass === ItemClass.Bottle && ounces === -1) {
    allTexts.push('It replenishes itself infinitely.');
  }

  // various requirements for the item
  if (requirements && requirements.level) {
    allTexts.push(`You must be level ${requirements.level} to use this item.`);
  }

  if (requirements && requirements.skill) {
    const formattedSkill =
      requirements?.skill?.name === Skill.Wand
        ? 'Magical Weapons'
        : requirements?.skill?.name;

    allTexts.push(
      `This item requires ${formattedSkill} skill ${requirements.skill.level}.`,
    );
  }

  // book stuffs
  if (itemClass === ItemClass.Book) {
    allTexts.push(`The book has ${pages?.length ?? 0} page(s) in it.`);
  }

  // trap stuffs
  if (itemClass === ItemClass.TrapSet) {
    allTexts.push('This trap is live.');
  }

  // the crafter
  if (item.mods.craftedBy) {
    allTexts.push(`This item was made by ${item.mods.craftedBy}.`);
  }

  // the owner text
  if (item.mods.owner) {
    if (item.mods.owner === player.username) {
      allTexts.push('This item belongs to you.');
    } else {
      allTexts.push('This item does NOT belong to you.');
    }
  }

  allTexts.push(`The item is in ${conditionString(item)} condition.`);

  return allTexts.join(' ');
}

export const foodTextFor = (
  player: IPlayer,
  item: ISimpleItem,
  itemDef: IItem,
) => {
  const desc = getProp(item, itemDef, 'desc');

  const useEffect = getProp(item, itemDef, 'useEffect');
  if (!useEffect) return '';

  const baseText = `You are looking at ${desc}.`;
  const statText = `This food changes the following stats: ${
    useEffect.extra?.tooltip ?? 'None'
  }`;

  return `${baseText} ${statText}`;
};

export const gemTextFor = (
  player: IPlayer,
  item: ISimpleItem,
  itemDef: IItem,
) => {
  const desc = getProp(item, itemDef, 'desc');

  const encrustGive = getProp(item, itemDef, 'encrustGive');
  if (!encrustGive) return '';

  const affectedStats = Object.keys(encrustGive.stats || {}) as Stat[];

  const baseText = `You are looking at ${desc}. `;

  const slotText = `This gem goes in the following slots: ${encrustGive.slots
    .map((x) => x.toUpperCase())
    .join(', ')}. `;

  const affectedStatsText = affectedStats
    .map((x) => `${formatStatForDisplay(x, encrustGive.stats[x])}`)
    .join(', ');
  const statText =
    affectedStats.length > 0
      ? `This gem changes the following stats: ${affectedStatsText}. `
      : '';

  const strikeEffect = encrustGive.strikeEffect;
  const effectText = strikeEffect
    ? `This gem confers the on-hit effect ${strikeEffect.name} at potency ${strikeEffect.potency}. `
    : '';

  return `${baseText}${slotText}${statText}${effectText}`;
};
