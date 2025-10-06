import { gainCurrency, loseCurrency } from '@lotr/currency';
import type { IPlayer } from '@lotr/interfaces';
import { Currency } from '@lotr/interfaces';
import { Injectable } from 'injection-js';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class BankHelper extends BaseService {
  public init() {}

  // deposit coins
  public deposit(
    player: IPlayer,
    amount: number,
    currency = Currency.Gold,
  ): void {
    player.bank.deposits[currency] ??= 0;
    player.bank.deposits[currency]! += amount;

    player.bank.deposits[currency] = Math.max(
      player.bank.deposits[currency]!,
      0,
    );

    loseCurrency(player, amount, currency);
  }

  // withdraw coins
  public withdraw(
    player: IPlayer,
    amount: number,
    currency = Currency.Gold,
  ): void {
    player.bank.deposits[currency] ??= 0;
    player.bank.deposits[currency]! -= amount;

    player.bank.deposits[currency] = Math.max(
      player.bank.deposits[currency]!,
      0,
    );

    gainCurrency(player, amount, currency);
  }
}
