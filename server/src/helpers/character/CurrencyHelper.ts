import { Injectable } from 'injection-js';
import { Currency, CurrencyType, ICharacter } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class CurrencyHelper extends BaseService {
  public init() {}

  // get the current currency value for a character
  public getCurrency(
    character: ICharacter,
    currency: CurrencyType = Currency.Gold,
  ): number {
    return character.currency[currency] ?? 0;
  }

  public hasCurrency(
    char: ICharacter,
    total: number,
    currency: CurrencyType = Currency.Gold,
  ): boolean {
    return (char.currency[currency] || 0) >= total;
  }

  // gain currency for a player
  public gainCurrency(
    char: ICharacter,
    currencyGained: number,
    currency: CurrencyType = Currency.Gold,
  ): void {
    if (!currency) return;

    currencyGained = this.game.userInputHelper.cleanNumber(currencyGained, 0, {
      floor: true,
    });
    char.currency[currency] = Math.max(
      Math.floor((char.currency[currency] ?? 0) + currencyGained),
      0,
    );
  }

  // lose currency for a player (either by taking it, or spending it)
  public loseCurrency(
    player: ICharacter,
    currencyLost: number,
    currency: CurrencyType = Currency.Gold,
  ): void {
    this.gainCurrency(player, -currencyLost, currency);
  }
}
