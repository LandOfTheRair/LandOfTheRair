import { Singleton } from 'typescript-ioc';
import { CoreStat, ICharacter, Stat } from '../../interfaces';

@Singleton
export class CharacterHelper {

  public init() {}

  // gain a permanent stat (from a bottle, or some other source)
  public gainPermanentStat(character: ICharacter, stat: CoreStat, value = 1): boolean {

    // hp/mp always go up with no limit
    if(stat === CoreStat.HP || stat === CoreStat.MP) {
      character.stats[stat] = (character.stats[stat] ?? 1) + value;
      return true;
    }

    const curStat = character.stats[stat] ?? 1;

    // TODO: make this based on the max region available
    const hardBaseCap = 30;

    // cannot exceed the hard cap
    if (curStat + value > hardBaseCap) return false;

    // but if we're under it, we boost
    character.stats[stat] = (character.stats[stat] ?? 1) + value;
    return true;

  }

  // calculate the total stats for a character from their current loadout
  public calculateStatTotals(character: ICharacter): void {
    character.totalStats = Object.assign({}, character.stats);

    // stats from effects
    // stats from classes
    // stats from usable items (check requirements, ownership durability)
      // stats from usable item / usable encrusts (check item requirements and encrust requirements)

    // adjust hp/mp RNs
    // adjust stealth / perception

    // trait bonuses
    // class specific bonuses

    // adjust pet stats
  }

  // get a specific stat value from a character
  public getStat(character: ICharacter, stat: Stat): number {
    return character.totalStats[stat] ?? 0;
  }

}
