
import { Injectable } from 'injection-js';
import stripe from 'stripe';

import { GameServerResponse, IAccount, IPlayer, isSubscribed, SilverPurchase, SubscriptionTier, ISilverPerk } from '../../interfaces';
import { Account } from '../../models';
import { BaseService } from '../../models/BaseService';

import * as Premium from '../../../content/_output/premium.json';

const Stripe = (stripe as any)(process.env.STRIPE_TOKEN);

@Injectable()
export class SubscriptionHelper extends BaseService {

  public init() {}

  // subscription checks
  public isSubscribed(account: IAccount): boolean {
    return isSubscribed(account);
  }

  public isPlayerSubscribed(player: IPlayer): boolean {
    return player.subscriptionTier > 0;
  }

  public getSubscriptionTier(account: IAccount): SubscriptionTier {
    if (account.isGameMaster) return SubscriptionTier.GM;
    if (account.isTester) return SubscriptionTier.Tester;
    return account.premium.subscriptionTier;
  }

  public async checkAccountForExpiration(account: IAccount) {
    if (Date.now() < account.premium.subscriptionEnds) return;

    account.premium.subscriptionEnds = 0;
    account.premium.subscriptionTier = SubscriptionTier.None;

    await this.saveAndUpdateAccount(account);
  }

  // buy with irl money
  public async buyWithIRLMoney(account: IAccount, token: any, item: any): Promise<void> {
    if (!process.env.STRIPE_TOKEN) throw new Error('Stripe is not configured');
    if (!item || !token) throw new Error('No item or no valid token');

    // subscription
    if (item.key.includes('sub')) {
      const purchaseItem = Premium.silverTiers.subscription.find(x => x.key === item.key);
      if (!purchaseItem) throw new Error('Invalid purchase item');

      // monthly
      try {
        const customer = await Stripe.customers.create({
          email: account.email
        });

        const source = await Stripe.customers.createSource(customer.id, {
          source: token.id
        });

        await Stripe.charges.create({
          amount: purchaseItem.price,
          currency: 'usd',
          customer: source.customer
        });

        await this.subscribe(account, purchaseItem.duration);
      } catch (e) {
        throw e;
      }

    // microtransaction
    } else {
      const purchaseItem = Premium.silverTiers.microtransaction.find(x => x.key === item.key);
      if (!purchaseItem) throw new Error('Invalid purchase item');

      try {
        const customer = await Stripe.customers.create({
          email: account.email
        });

        const source = await Stripe.customers.createSource(customer.id, {
          source: token.id
        });

        await Stripe.charges.create({
          amount: purchaseItem.price,
          currency: 'usd',
          customer: source.customer
        });

        await this.modifyAccountSilver(account, purchaseItem.silver);
      } catch (e) {
        throw e;
      }
    }


    this.game.wsCmdHandler.sendToSocket(account.username, {
      type: GameServerResponse.SendAlert,
      title: 'Payment Success!',
      content: 'Your payment has gone through. Enjoy your new content!',
    });
  }

  // update functions
  private async saveAndUpdateAccount(account: IAccount): Promise<void> {
    await this.game.accountDB.saveAccount(account as Account);
    this.game.lobbyManager.updateAccount(account);
  }

  public getSilverItem(purchaseKey: string): ISilverPerk | undefined {
    return Premium.silverPurchases.find(x => x.key === purchaseKey);
  }

  public canBuySilverItem(account: IAccount, purchaseKey: SilverPurchase): boolean {
    const purchase = this.getSilverItem(purchaseKey);
    if (!purchase) return false;

    const purchases = account.premium.silverPurchases?.[purchaseKey] ?? 0;
    if (purchase.maxPurchases > -1 && purchases >= purchase.maxPurchases) return false;

    return (account.premium.silver ?? 0) >= purchase.cost;
  }

  public buySilverItem(account: IAccount, purchaseKey: SilverPurchase): void {
    const purchase = this.getSilverItem(purchaseKey);
    if (!purchase) return;

    this.modifyAccountSilver(account, -purchase.cost);
    this.updateSilverPurchaseTotal(account, purchaseKey, 1);
  }

  public async updateSilverPurchaseTotal(account: IAccount, purchase: SilverPurchase, delta = 1): Promise<void> {
    account.premium.silverPurchases ??= {};
    account.premium.silverPurchases[purchase] ??= 0;
    account.premium.silverPurchases[purchase]! += delta;

    const festival = this.getSilverItem(purchase)?.festival;
    if (festival) {
      const oldEvent = this.game.dynamicEventHelper.getEvents().find(x => x.name === festival.name);
      if (oldEvent) {
        oldEvent.endsAt += (6 * 3600 * 1000);
        this.game.dynamicEventHelper.updateEvent(oldEvent);

      } else {
        const newEvent = {
          name: festival.name,
          description: 'A Player-started festival!',
          endsAt: Date.now() + (6 * 3600 * 1000),
          statBoost: festival.stats
        };

        this.game.dynamicEventHelper.startEvent(newEvent);
      }
    }

    await this.saveAndUpdateAccount(account);
  }

  public async subscribe(account: IAccount, months: number): Promise<void> {
    await this.startTrial(account, months * 30, SubscriptionTier.Basic);
    await this.modifyAccountSilver(account, months * 500);

    await this.saveAndUpdateAccount(account);
  }

  public async unsubscribe(account: IAccount): Promise<void> {
    account.premium.subscriptionTier = SubscriptionTier.None;

    await this.saveAndUpdateAccount(account);
  }

  public async startTrial(account: IAccount, expirationDays = 30, tier = SubscriptionTier.Trial): Promise<void> {
    let date = new Date();
    if (account.premium.subscriptionEnds > 0) date = new Date(account.premium.subscriptionEnds);

    date.setDate(date.getDate() + expirationDays);
    account.premium.subscriptionEnds = date.getTime();
    account.premium.hasDoneTrial = tier <= 1;
    account.premium.subscriptionTier = tier;

    await this.saveAndUpdateAccount(account);
  }

  // silver functions
  public async modifyAccountSilver(account: IAccount, amount = 0): Promise<void> {
    account.premium.silver ??= 0;
    account.premium.silver += amount;

    await this.saveAndUpdateAccount(account);
  }

  public gainSilver(player: IPlayer, amount = 0): void {
    const account = this.game.lobbyManager.getAccount(player.username);
    this.modifyAccountSilver(account, amount);
  }

  public loseSilver(player: IPlayer, amount = 0): void {
    this.gainSilver(player, -amount);
  }

  // subscription perks
  public maxCharacters(account: IAccount, baseValue = 4): number {
    return baseValue + ((account?.premium.silverPurchases?.[SilverPurchase.MoreCharacters] ?? 0));
  }

  public maxSmithRepair(player: IPlayer, baseValue = 20000): number {
    return baseValue + (player.subscriptionTier * 1000);
  }

  public smithRepairCost(player: IPlayer, repairCost: number): number {
    return Math.floor(repairCost - (repairCost * 0.05 * player.subscriptionTier));
  }

  public maxAlchemistOz(player: IPlayer, baseValue = 10): number {
    const account = this.game.lobbyManager.getAccount(player.username);
    return baseValue + ((account?.premium.silverPurchases?.[SilverPurchase.MorePotions] ?? 0) * 5);
  }

  public maxSuccorOz(player: IPlayer, baseValue = 1): number {
    return baseValue + Math.floor(player.subscriptionTier / 5);
  }

  public maxMaterialStorageSpace(player: IPlayer, baseValue = 200): number {
    const account = this.game.lobbyManager.getAccount(player.username);
    return baseValue + ((account?.premium.silverPurchases?.[SilverPurchase.ExpandedMaterialStorage] ?? 0) * 200);
  }

  public axpGained(player: IPlayer, baseValue = 1): number {
    return baseValue * (player.subscriptionTier > 0 ? 2 : 1);
  }

  public xpGained(player: IPlayer, baseValue = 1): number {
    return baseValue + (1 + player.subscriptionTier * 0.05);
  }

  public skillGained(player: IPlayer, baseValue = 1): number {
    return baseValue + (1 + player.subscriptionTier * 0.05);
  }

  public hasPouch(player: IPlayer): boolean {
    const account = this.game.lobbyManager.getAccount(player.username);
    return (account?.premium.silverPurchases?.[SilverPurchase.MagicPouch] ?? 0) > 0;
  }

  public hasSharedLocker(player: IPlayer): boolean {
    const account = this.game.lobbyManager.getAccount(player.username);
    return (account?.premium.silverPurchases?.[SilverPurchase.SharedLockers] ?? 0) > 0;
  }
}
