import { Injectable } from 'injection-js';
import stripe from 'stripe';

import {
  GameServerResponse,
  IAccount,
  IPlayer,
  ISilverPerk,
  isSubscribed,
  SilverPurchase,
  SubscriptionTier,
} from '../../interfaces';
import { Account } from '../../models';
import { BaseService } from '../../models/BaseService';

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

  public getSilverCosmetics(account: IAccount) {
    return {
      inversify:
        account.premium.silverPurchases[SilverPurchase.CosmeticInversify],
      ancientify:
        account.premium.silverPurchases[SilverPurchase.CosmeticAncientify],
      etherpulse:
        account.premium.silverPurchases[SilverPurchase.CosmeticEtherPulse],
      ghostether:
        account.premium.silverPurchases[SilverPurchase.CosmeticGhostEther],
    };
  }

  public takeCosmetic(account: IAccount, cosmetic: SilverPurchase) {
    if (!account.premium.silverPurchases[cosmetic]) return;

    const amount = account.premium.silverPurchases[cosmetic] ?? 1;
    account.premium.silverPurchases[cosmetic] = amount - 1;
    this.game.accountDB.saveAccount(account as Account);
  }

  public async checkAccountForExpiration(account: IAccount) {
    if (Date.now() < account.premium.subscriptionEnds) return;

    account.premium.subscriptionEnds = 0;
    account.premium.subscriptionTier = SubscriptionTier.None;

    await this.saveAndUpdateAccount(account);
  }

  // buy with irl money
  public async buyWithIRLMoney(
    account: IAccount,
    token: any,
    item: any,
  ): Promise<void> {
    if (!process.env.STRIPE_TOKEN) throw new Error('Stripe is not configured');
    if (!item || !token) throw new Error('No item or no valid token');

    const silverTiers = this.game.contentManager.premiumData.silverTiers;

    // subscription
    if (item.key.includes('sub')) {
      const purchaseItem = silverTiers.subscription.find(
        (x) => x.key === item.key,
      );
      if (!purchaseItem) throw new Error('Invalid purchase item');

      // monthly
      try {
        const customer = await Stripe.customers.create({
          email: account.email,
        });

        const source = await Stripe.customers.createSource(customer.id, {
          source: token.id,
        });

        await Stripe.charges.create({
          amount: purchaseItem.price,
          currency: 'usd',
          customer: source.customer,
        });

        await this.subscribe(account, purchaseItem.duration ?? 1);
      } catch (e) {
        throw e;
      }

      // microtransaction
    } else {
      const purchaseItem = silverTiers.microtransaction.find(
        (x) => x.key === item.key,
      );
      if (!purchaseItem) throw new Error('Invalid purchase item');

      try {
        const customer = await Stripe.customers.create({
          email: account.email,
        });

        const source = await Stripe.customers.createSource(customer.id, {
          source: token.id,
        });

        await Stripe.charges.create({
          amount: purchaseItem.price,
          currency: 'usd',
          customer: source.customer,
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
    const silverPurchases =
      this.game.contentManager.premiumData.silverPurchases;
    return silverPurchases.find((x) => x.key === purchaseKey);
  }

  public canBuySilverItem(
    account: IAccount,
    purchaseKey: SilverPurchase,
  ): boolean {
    const purchase = this.getSilverItem(purchaseKey);
    if (!purchase) return false;

    const purchases = account.premium.silverPurchases?.[purchaseKey] ?? 0;
    if (purchase.maxPurchases > -1 && purchases >= purchase.maxPurchases) {
      return false;
    }

    return (account.premium.silver ?? 0) >= purchase.cost;
  }

  public buySilverItem(account: IAccount, purchaseKey: SilverPurchase): void {
    const purchase = this.getSilverItem(purchaseKey);
    if (!purchase) return;

    this.modifyAccountSilver(account, -purchase.cost);
    this.updateSilverPurchaseTotal(account, purchaseKey, 1);
  }

  public async updateSilverPurchaseTotal(
    account: IAccount,
    purchase: SilverPurchase,
    delta = 1,
  ): Promise<void> {
    account.premium.silverPurchases ??= {};
    account.premium.silverPurchases[purchase] ??= 0;
    account.premium.silverPurchases[purchase]! += delta;

    const festival = this.getSilverItem(purchase)?.festival;
    if (festival) {
      const oldEvent = this.game.dynamicEventHelper
        .getEvents()
        .find((x) => x.name === festival.name);
      if (oldEvent) {
        oldEvent.endsAt += 6 * 3600 * 1000;
        this.game.dynamicEventHelper.updateEvent(oldEvent);
        this.game.messageHelper.broadcastSystemMessage(
          `${account.username} extended the ${oldEvent.name} by 6 hours!`,
        );
      } else {
        const newEvent = {
          name: festival.name,
          description: 'A Player-started festival!',
          endsAt: Date.now() + 6 * 3600 * 1000,
          statBoost: festival.stats,
        };

        this.game.dynamicEventHelper.startEvent(newEvent);
        this.game.messageHelper.broadcastSystemMessage(
          `${account.username} started the ${newEvent.name} for 6 hours!`,
        );
      }
    }

    this.game.logger.log(
      'Subscription:SilverPurchaseTotal',
      `${account.username} has bought ${purchase}.`,
    );

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

  public async startTrial(
    account: IAccount,
    expirationDays = 30,
    tier = SubscriptionTier.Trial,
  ): Promise<void> {
    let date = new Date();
    if (account.premium.subscriptionEnds > 0) {
      date = new Date(account.premium.subscriptionEnds);
    }

    date.setDate(date.getDate() + expirationDays);
    account.premium.subscriptionEnds = date.getTime();
    account.premium.hasDoneTrial = tier <= 1;
    account.premium.subscriptionTier = tier;

    this.game.logger.log(
      'Subscription:SubscriptionStart',
      `${account.username} has started a tier ${tier} trial.`,
    );

    await this.saveAndUpdateAccount(account);
  }

  // silver functions
  public async modifyAccountSilver(
    account: IAccount,
    amount = 0,
  ): Promise<void> {
    account.premium.silver ??= 0;
    account.premium.silver += amount;

    const message = amount > 0 ? 'was given' : 'has spent';
    this.game.logger.log(
      'Subscription:SilverChange',
      `${account.username} ${message} ${amount} silver.`,
    );

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
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'characters') ?? 1;
    return (
      baseValue +
      mult *
        (account?.premium.silverPurchases?.[SilverPurchase.MoreCharacters] ?? 0)
    );
  }

  public maxSmithRepair(player: IPlayer, baseValue = 20000): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'smithRepair') ??
      1000;
    return baseValue + player.subscriptionTier * mult;
  }

  public smithRepairCost(player: IPlayer, repairCost: number): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'smithCost') ??
      0.05;
    return Math.floor(repairCost - repairCost * mult * player.subscriptionTier);
  }

  public maxAlchemistOz(player: IPlayer, baseValue = 10): number {
    const account = this.game.lobbyManager.getAccount(player.username);
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'alchemistOz') ?? 5;
    return (
      baseValue +
      (account?.premium.silverPurchases?.[SilverPurchase.MorePotions] ?? 0) *
        mult
    );
  }

  public docReduction(player: IPlayer, baseValue = 10): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'statDoc') ?? 0.05;
    return Math.max(
      1,
      Math.floor(baseValue - baseValue * mult * player.subscriptionTier),
    );
  }

  public maxSuccorOz(player: IPlayer, baseValue = 1): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'succorOz') ?? 1;
    return baseValue + player.subscriptionTier * mult;
  }

  public maxMarketListings(player: IPlayer, baseValue = 25): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'marketListings') ??
      5;
    return baseValue + player.subscriptionTier * mult;
  }

  public maxMaterialStorageSpace(player: IPlayer, baseValue = 200): number {
    const account = this.game.lobbyManager.getAccount(player.username);
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'storageSpace') ??
      200;
    return (
      baseValue +
      (account?.premium.silverPurchases?.[
        SilverPurchase.ExpandedMaterialStorage
      ] ?? 0) *
        mult
    );
  }

  public axpGained(player: IPlayer, baseValue = 1): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'axpGain') ?? 1;
    return baseValue * (player.subscriptionTier > 0 ? 1 + mult : 1);
  }

  public xpGained(player: IPlayer, baseValue = 1): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'xpGain') ?? 0.05;
    return baseValue + (1 + player.subscriptionTier * mult);
  }

  public skillGained(player: IPlayer, baseValue = 1): number {
    const mult =
      this.game.contentManager.getGameSetting('subscriber', 'skillGain') ??
      0.05;
    return baseValue + (1 + player.subscriptionTier * mult);
  }

  public buildSlots(player: IPlayer, baseValue = 3): number {
    const bonusSlots =
      this.game.contentManager.getGameSetting('subscriber', 'buildSlots') ?? 3;
    return baseValue + bonusSlots;
  }

  public holidayTokensGained(player: IPlayer, baseValue = 1): number {
    const mult =
      this.game.contentManager.getGameSetting(
        'subscriber',
        'holidayTokenGain',
      ) ?? 2;
    return baseValue * (player.subscriptionTier > 0 ? mult : 1);
  }

  public hasPouch(player: IPlayer): boolean {
    const account = this.game.lobbyManager.getAccount(player.username);
    return (
      (account?.premium.silverPurchases?.[SilverPurchase.MagicPouch] ?? 0) > 0
    );
  }

  public hasSharedLocker(player: IPlayer): boolean {
    const account = this.game.lobbyManager.getAccount(player.username);
    return (
      (account?.premium.silverPurchases?.[SilverPurchase.SharedLockers] ?? 0) >
      0
    );
  }
}
