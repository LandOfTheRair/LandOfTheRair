import { Stat } from '../interfaces';

export function getStatDescription(stat: Stat, value = 1): string {
  const value5 = Math.floor(value / 5);
  const array = statValues[stat];
  return array[Math.min(value5, array.length - 1)];
}

const statValues = {
  [Stat.STR]: [
    'Puny',
    'Weak',
    'Average',
    'Strong',
    'Muscular',
    'Extremely Strong'
  ],
  [Stat.DEX]: [
    'Uncoordinated',
    'Clumsy',
    'Average',
    'Handy',
    'Deft',
    'Extremely Dextrous'
  ],
  [Stat.AGI]: [
    'Slow',
    'Stiff',
    'Average',
    'Spry',
    'Nimble',
    'Fleet-footed'
  ],
  [Stat.INT]: [
    'Brainless',
    'Dense',
    'Average',
    'Sharp',
    'Smart',
    'Extremely Intelligent'
  ],
  [Stat.WIS]: [
    'Foolish',
    'Silly',
    'Average',
    'Shrewd',
    'Wise',
    'Sagacious'
  ],
  [Stat.WIL]: [
    'Infirmed',
    'Easily-shaken',
    'Average',
    'Determined',
    'Resolved',
    'Resolute'
  ],
  [Stat.CON]: [
    'Frail',
    'Weakened',
    'Average',
    'Fit',
    'Well-built',
    'Robust'
  ],
  [Stat.LUK]: [
    'Ill-fated',
    'Unlucky',
    'Average',
    'Favorable',
    'Fortunate',
    'Extremely Lucky'
  ],
  [Stat.CHA]: [
    'Abhorrent',
    'Ugly',
    'Average',
    'Pleasant',
    'Attractive',
    'Extremely Charismatic'
  ]
}