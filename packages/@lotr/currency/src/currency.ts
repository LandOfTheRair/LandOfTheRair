import type { CurrencyType, ICharacter } from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { cleanNumber } from '@lotr/shared';

// get the current currency value for a character
export function getCurrency(
  character: ICharacter,
  currency: CurrencyType = Currency.Gold,
): number {
  return character.currency[currency] ?? 0;
}

export function hasCurrency(
  char: ICharacter,
  total: number,
  currency: CurrencyType = Currency.Gold,
): boolean {
  return (char.currency[currency] || 0) >= total;
}

// gain currency for a player
export function gainCurrency(
  char: ICharacter,
  currencyGained: number,
  currency: CurrencyType = Currency.Gold,
): void {
  if (!currency) return;

  currencyGained = cleanNumber(currencyGained, 0, {
    floor: true,
  });

  char.currency[currency] = Math.max(
    Math.floor((char.currency[currency] ?? 0) + currencyGained),
    0,
  );
}

// lose currency for a player (either by taking it, or spending it)
export function loseCurrency(
  player: ICharacter,
  currencyLost: number,
  currency: CurrencyType = Currency.Gold,
): void {
  gainCurrency(player, -currencyLost, currency);
}
