
import { Injectable } from 'injection-js';
import { Currency, IPlayer } from '../../interfaces';
import { BaseService } from '../../models/BaseService';

@Injectable()
export class BankHelper extends BaseService {

  public init() {}

  // deposit coins
  public deposit(player: IPlayer, amount: number, currency = Currency.Gold): void {
    player.bank.deposits[currency] = player.bank.deposits[currency] ?? 0;
    player.bank.deposits[currency]! += amount;

    player.bank.deposits[currency] = Math.max(player.bank.deposits[currency]!, 0);

    this.game.currencyHelper.loseCurrency(player, amount, currency);
  }

  // withdraw coins
  public withdraw(player: IPlayer, amount: number, currency = Currency.Gold): void {
    player.bank.deposits[currency] = player.bank.deposits[currency] ?? 0;
    player.bank.deposits[currency]! -= amount;

    player.bank.deposits[currency] = Math.max(player.bank.deposits[currency]!, 0);

    this.game.currencyHelper.gainCurrency(player, amount, currency);
  }

}
