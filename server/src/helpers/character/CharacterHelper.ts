
import { Injectable } from 'injection-js';
import { clamp } from 'lodash';

import { BaseService, CoreStat, ICharacter, IPlayer, Stat } from '../../interfaces';

@Injectable()
export class CharacterHelper extends BaseService {

  public init() {}

  // check if the character is dead
  public isDead(char: ICharacter): boolean {
    return char.hp.__current <= 0;
  }

  public healToFull(char: ICharacter): void {
    this.heal(char, char.hp.maximum);
  }

  public manaToFull(char: ICharacter): void {
    this.mana(char, char.mp.maximum);
  }

  public heal(char: ICharacter, hp: number): void {
    char.hp.__current = clamp(char.hp.__current + hp, char.hp.minimum, char.hp.maximum);
  }

  public mana(char: ICharacter, mp: number): void {
    char.mp.__current = clamp(char.mp.__current + mp, char.mp.minimum, char.mp.maximum);
  }

  // check if a character is a player
  public isPlayer(character: ICharacter): boolean {
    return !!(character as IPlayer).username;
  }

  // gain a permanent stat (from a bottle, or some other source)
  public gainPermanentStat(character: ICharacter, stat: CoreStat, value = 1): boolean {

    // hp/mp always go up with no limit
    if (stat === CoreStat.HP || stat === CoreStat.MP) {
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
    character.totalStats.move = clamp(0, 4, character.stats[Stat.Move] || 3);

    // stats from effects
    // stats from classes
    // stats from usable items (check requirements, ownership, durability)
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

  public tick(character: ICharacter): void {
    const hpRegen = this.getStat(character, Stat.HPRegen) + Math.max(0, this.getStat(character, Stat.CON) - 15);
    const mpRegen = this.getStat(character, Stat.MPRegen);

    if (character.hp.__current + hpRegen > 0) this.heal(character, hpRegen);
    this.mana(character, mpRegen);
  }

  // check to see if any effects are expired
  public tickEffects(character: ICharacter) {

  }

  // check gear and try to cast effects
  public tryToCastEquipmentEffects(character: ICharacter) {

  }

}
