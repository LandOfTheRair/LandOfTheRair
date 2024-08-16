// check the hostility level between two characters

import {
  Alignment,
  Allegiance,
  Hostility,
  Stat,
} from '@interfaces/building-blocks';
import { ICharacter } from '@interfaces/character';
import { INPC } from '@interfaces/npc';
import { IPlayer } from '@interfaces/player';
import { isHostileTo } from '../../../../../shared/functions';

// any changes here _might_ need to be made to server/checkTargetForHostility
export function hostilityLevelFor(
  origin: ICharacter,
  compare: ICharacter,
): 'hostile' | 'neutral' | 'friendly' | 'stealth' {
  const isHiddenTo = () =>
    origin.effects._hash.Hidden &&
    (origin.totalStats?.[Stat.Stealth] ?? 0) >
      (compare.totalStats?.[Stat.Perception] ?? 0);
  const alignmentConsideringHidden = () =>
    isHiddenTo() ? 'stealth' : 'hostile';

  if (!origin) return 'neutral';

  if (origin.allegiance === Allegiance.GM) return 'neutral';
  if (compare.allegiance === Allegiance.NaturalResource) return 'neutral';

  if (
    (origin as IPlayer).partyName &&
    (origin as IPlayer).partyName === (compare as IPlayer).partyName
  ) {
    return 'neutral';
  }

  if (compare.agro[origin.uuid] || origin.agro[compare.uuid]) {
    return alignmentConsideringHidden();
  }

  if (
    origin.effects._hash.Disguise &&
    origin.totalStats[Stat.CHA] > compare.totalStats[Stat.WIL]
  ) {
    return 'stealth';
  }

  const hostility = (compare as INPC).hostility;

  if (!hostility) return 'neutral';

  if (hostility === Hostility.Never) return 'friendly';

  if (hostility === Hostility.Faction) {
    if (
      isHostileTo(origin, compare.allegiance) ||
      isHostileTo(compare, origin.allegiance)
    ) {
      return alignmentConsideringHidden();
    }
  }

  if (origin.allegiance === compare.allegiance) return 'neutral';

  if (hostility === Hostility.Always) return alignmentConsideringHidden();

  if (
    origin.alignment === Alignment.Evil &&
    compare.alignment === Alignment.Good
  ) {
    return alignmentConsideringHidden();
  }

  return 'neutral';
}
