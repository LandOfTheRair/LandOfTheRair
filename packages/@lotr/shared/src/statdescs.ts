import { Stat } from '@lotr/interfaces';

const statValues: Partial<Record<Stat, string[]>> = {
  [Stat.STR]: ['Puny', 'Weak', 'Average', 'Strong', 'Muscular', 'Herculean'],
  [Stat.DEX]: [
    'Uncoordinated',
    'Clumsy',
    'Average',
    'Handy',
    'Deft',
    'Artemesian',
  ],
  [Stat.AGI]: ['Slow', 'Stiff', 'Average', 'Spry', 'Nimble', 'Hermesian'],
  [Stat.INT]: ['Brainless', 'Dense', 'Average', 'Sharp', 'Smart', 'Aethene'],
  [Stat.WIS]: ['Foolish', 'Silly', 'Average', 'Shrewd', 'Wise', 'Sagacious'],
  [Stat.WIL]: [
    'Infirmed',
    'Easily-shaken',
    'Average',
    'Determined',
    'Resolved',
    'Resolute',
  ],
  [Stat.CON]: ['Frail', 'Weakened', 'Average', 'Fit', 'Well-built', 'Robust'],
  [Stat.LUK]: [
    'Ill-fated',
    'Unlucky',
    'Average',
    'Favorable',
    'Fortunate',
    'Erna',
  ],
  [Stat.CHA]: [
    'Abhorrent',
    'Ugly',
    'Average',
    'Pleasant',
    'Attractive',
    'Bardacious',
  ],
};

export function getStatDescription(stat: Stat, value = 1): string {
  const value5 = Math.floor(value / 5);
  const array = statValues[stat] ?? [];
  return array[Math.min(value5, array.length - 1)] ?? '';
}
