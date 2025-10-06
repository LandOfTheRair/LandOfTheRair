import type { IPlayer } from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { gainCurrency, loseCurrency } from './currency';

// deposit coins
export function bankDeposit(
  player: IPlayer,
  amount: number,
  currency = Currency.Gold,
): void {
  player.bank.deposits[currency] ??= 0;
  player.bank.deposits[currency]! += amount;

  player.bank.deposits[currency] = Math.max(player.bank.deposits[currency]!, 0);

  loseCurrency(player, amount, currency);
}

// withdraw coins
export function bankWithdraw(
  player: IPlayer,
  amount: number,
  currency = Currency.Gold,
): void {
  player.bank.deposits[currency] ??= 0;
  player.bank.deposits[currency]! -= amount;

  player.bank.deposits[currency] = Math.max(player.bank.deposits[currency]!, 0);

  gainCurrency(player, amount, currency);
}
