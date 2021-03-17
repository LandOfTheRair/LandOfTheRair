import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameServerEvent, IAccount, ISilverPerk } from '../../../../interfaces';
import { AccountState } from '../../../../stores';

import * as Premium from '../../../../assets/content/_output/premium.json';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-managesilver',
  templateUrl: './managesilver.component.html',
  styleUrls: ['./managesilver.component.scss']
})
export class ManageSilverComponent implements OnInit {

  @Select(AccountState.account) public account$: Observable<IAccount>;

  public get allPremium() {
    return Premium;
  }

  private stripeCheckoutHandler: any;
  private currentlyBuyingItem = null;

  constructor(
    public dialogRef: MatDialogRef<ManageSilverComponent>,
    private socketService: SocketService
  ) { }

  ngOnInit() {

    if (!(window as any).StripeCheckout) return;

    this.stripeCheckoutHandler = (window as any).StripeCheckout.configure({
      key: environment.stripe.key,
      name: 'Land of the Rair',
      allowRememberMe: true,
      zipCode: true,
      billingAddress: true,
      currency: 'USD',
      image: 'https://play.rair.land/assets/favicon/android-chrome-512x512.png',
      token: (token) => {
        this.socketService.emit(GameServerEvent.PremiumBuy, { token, item: this.currentlyBuyingItem });
      }
    });
  }

  buy(account: IAccount, item) {
    if (!this.stripeCheckoutHandler) return alert('Could not start; Stripe was unable to initialize properly.');

    this.currentlyBuyingItem = item;

    this.stripeCheckoutHandler.open({
      amount: item.price,
      email: account.email,
      description: item.silver ? `${item.silver.toLocaleString()} Silver` : `${item.duration} Month Subscription`
    });
  }

  buySilverItem(item: ISilverPerk) {
    this.socketService.emit(GameServerEvent.PremiumSilverBuy, { item: item.key });
  }

}
