import { HttpClient } from '@angular/common/http';
import { Component, effect, inject } from '@angular/core';
import { select, Store } from '@ngxs/store';

import { cloneDeep, debounce, get, startCase } from 'lodash';

import {
  EquippableItemClasses,
  IMarketItemInfo,
  IMarketListing,
  IMarketPickup,
  ItemClass,
  ItemSlot,
  WeaponClasses,
} from '@lotr/interfaces';
import { GameState, HideMarketWindow, HideWindow } from '../../../../stores';
import { APIService } from '../../../services/api.service';
import { AssetService } from '../../../services/asset.service';

import { GameService } from '../../../services/game.service';
import { ModalService } from '../../../services/modal.service';

import { calculateListingFee, itemListError } from '@lotr/shared';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
})
export class MarketComponent {
  public curPos = select(GameState.currentPosition);
  public market = select(GameState.currentMarketWindow);
  public inGame = select(GameState.inGame);
  public player = select(GameState.player);

  private lastPos = { x: 0, y: 0 };
  public marketInfo: any = {};
  public isLoading = false;

  public searchQuery = '';
  public sellValue = 1;

  public currentPage = 0;
  public currentSort: any;
  public currentTab = 'Buy';
  public debouncedSearch = debounce(() => this.changeSearchText(), 200);

  public buyableListings: IMarketListing[];
  public myListings: IMarketListing[];
  public myPickups: IMarketPickup[];

  public tabs = ['Buy', 'Sell', 'My Listings', 'Pick Up'];

  public sortOptions = [
    { name: 'Most Recent', sort: 'mostrecent' },
    { name: 'Least Recent', sort: 'leastrecent' },
    { name: 'Price: Low to High', sort: 'lowtohigh' },
    { name: 'Price: High to Low', sort: 'hightolow' },
  ];

  public filterTags: Array<{
    name: string;
    includedTypes: string[];
    isIncluded?: boolean;
    setSearchKey?: string;
  }> = [
    { name: 'Bottles', includedTypes: [ItemClass.Bottle] },
    {
      name: 'Cosmetics',
      includedTypes: [ItemClass.Scroll],
      setSearchKey: 'Cosmetic',
    },
    { name: 'Food', includedTypes: [ItemClass.Food] },
    { name: 'Gear', includedTypes: EquippableItemClasses },
    { name: 'Gems', includedTypes: [ItemClass.Gem] },
    {
      name: 'Misc',
      includedTypes: [
        ItemClass.Box,
        ItemClass.Book,
        ItemClass.Key,
        ItemClass.Skull,
      ],
    },
    {
      name: 'Reagents',
      includedTypes: [ItemClass.Flower, ItemClass.Rock, ItemClass.Twig],
    },
    { name: 'Rings', includedTypes: [ItemClass.Ring] },
    { name: 'Scrolls', includedTypes: [ItemClass.Scroll] },
    { name: 'Traps', includedTypes: [ItemClass.Trap] },
    { name: 'Weapons', includedTypes: WeaponClasses },
  ];

  public get listingFeePercent() {
    return this.listingFeePercent() * 100;
  }

  public get listingFee(): number {
    if (!this.player) return 0;

    const item = this.player().items.equipment[ItemSlot.RightHand];
    if (!item) return 0;

    const realItem = this.assetService.getItem(item.name);
    if (!realItem) return 0;

    return calculateListingFee(realItem, this.sellValue);
  }

  public get sellError(): string {
    if (!this.player) return '';

    const item = this.player().items.equipment[ItemSlot.RightHand];
    if (!item) return 'You need to hold an item to sell.';

    const realItem = this.assetService.getItem(item.name);
    if (!realItem) return 'That item is too unique to sell.';

    return itemListError(this.player(), item, realItem, this.sellValue);
  }

  public get canGoBack() {
    return this.currentPage !== 0;
  }

  public get canGoForward() {
    return this.buyableListings?.length > 0;
  }

  private http = inject(HttpClient);
  private store = inject(Store);
  private assetService = inject(AssetService);
  private modalService = inject(ModalService);
  private api = inject(APIService);
  public uiService = inject(UIService);
  public gameService = inject(GameService);

  constructor() {
    effect(
      () => {
        const pos = this.curPos();
        if (!pos) return;
        if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;

        if (this.marketInfo.npcUUID) {
          this.store.dispatch(new HideMarketWindow());
          this.store.dispatch(new HideWindow('market'));
          this.reset();
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      const data = this.market();
      this.marketInfo = cloneDeep(data || {});
      this.currentTab = '';

      setTimeout(() => {
        this.switchTab('Buy');
      }, 0);
    });

    effect(
      () => {
        this.inGame();

        this.store.dispatch(new HideMarketWindow());
        this.store.dispatch(new HideWindow('market'));
        this.reset();
      },
      { allowSignalWrites: true },
    );
  }

  private reset() {
    this.currentPage = 0;
    this.changeSort(this.sortOptions[0].sort);
    this.myListings = null;
    this.myPickups = null;
    this.buyableListings = null;
    this.sellValue = 1;
    this.searchQuery = '';
    this.filterTags.forEach((t) => (t.isIncluded = false));
    this.currentTab = null;
  }

  switchTab(newTab: string) {
    if (this.currentTab === newTab) return;

    this.currentTab = newTab;

    if (newTab === 'Buy') {
      this.changeSort(this.sortOptions[0].sort);
      this.loadBuyOptions();
    }

    if (newTab === 'My Listings') {
      this.loadMyListings();
    }

    if (newTab === 'Pick Up') {
      this.loadMyPickups();
    }
  }

  changePage(delta: number) {
    this.currentPage += delta;
    this.loadBuyOptions();
  }

  changeSort(sort: string) {
    this.currentSort = sort;
    this.loadBuyOptions();
  }

  changeSearchText() {
    this.loadBuyOptions();
  }

  loadBuyOptions() {
    if (!this.player) return;

    this.isLoading = true;

    this.http
      .get(this.api.finalHTTPURL + `/market/listings/all`, {
        params: {
          search: this.searchQuery,
          page: this.currentPage.toString(),
          sort: this.currentSort,
          filter: this.filterTags
            .filter((x) => x.isIncluded)
            .map((x) => x.includedTypes)
            .flat()
            .join(','),
        },
      })
      .subscribe((d) => {
        this.buyableListings = (d as IMarketListing[]) || [];
        this.isLoading = false;
      });
  }

  loadMyListings() {
    if (!this.player) return;

    this.isLoading = true;

    this.http
      .get(
        this.api.finalHTTPURL +
          `/market/listings/mine?username=${this.player().username}`,
      )
      .subscribe((d) => {
        this.myListings = (d as IMarketListing[]) || [];
        this.isLoading = false;
      });
  }

  loadMyPickups() {
    if (!this.player) return;

    this.http
      .get(
        this.api.finalHTTPURL +
          `/market/pickups/mine?username=${this.player().username}`,
      )
      .subscribe((d) => {
        this.myPickups = (d as IMarketPickup[]) || [];
        this.isLoading = false;
      });
  }

  public starTextFor(itemInfo: IMarketItemInfo) {
    const quality = get(itemInfo, 'itemOverride.quality', 0);
    return quality - 2 > 0
      ? Array(quality - 2)
          .fill('★')
          .join('')
      : '';
  }

  public statStringFor(itemInfo: IMarketItemInfo) {
    const stats = get(itemInfo, 'itemOverride.stats', {});
    const statKeys = Object.keys(stats);
    if (statKeys.length === 0) return '';
    return statKeys
      .map(
        (stat) =>
          `${stats[stat] < 0 ? '' : '+'}${stats[stat]} ${stat.toUpperCase()}`,
      )
      .filter(Boolean)
      .join(', ');
  }

  public traitStringFor(itemInfo: IMarketItemInfo) {
    const trait = get(itemInfo, 'itemOverride.trait', { name: '', level: '' });
    if (!trait || !trait.name || !trait.level) return '';

    const levelStrings = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return `${startCase(trait.name)} ${levelStrings[trait.level] ?? '?'}`;
  }

  public effectStringFor(itemInfo: IMarketItemInfo) {
    const itemEffect =
      itemInfo.itemOverride.useEffect ||
      itemInfo.itemOverride.trapEffect ||
      itemInfo.itemOverride.equipEffect ||
      itemInfo.itemOverride.strikeEffect;

    if (!itemEffect || !itemEffect.name || !itemEffect.potency) return '';
    if (
      itemEffect.name.includes('Permanent') ||
      itemEffect.name.includes('Fill') ||
      itemEffect.name.includes('Nourishment')
    ) {
      return '';
    }

    return `${startCase(itemEffect.name)} (Str. ${itemEffect.potency})`;
  }

  public requirementTooltipFor(listing: IMarketListing) {
    const requirements = listing.itemInfo.requirements;
    if (!requirements) return `Requirements: none`;

    const reqArr = [];
    if (requirements.level) reqArr.push(`Level: ${requirements.level}`);
    if (requirements.baseClass) reqArr.push(`Class: ${requirements.baseClass}`);

    return `Requirements - ${reqArr.join(', ')}`;
  }

  public toggleFilter(filter) {
    filter.isIncluded = !filter.isIncluded;

    if (filter.setSearchKey) {
      if (filter.isIncluded) {
        this.filterTags.forEach(
          (tag) => (tag.isIncluded = tag.setSearchKey === filter.setSearchKey),
        );
        this.searchQuery = filter.setSearchKey;
      } else {
        this.searchQuery = '';
      }
    } else {
      this.filterTags.forEach((tag) => {
        if (
          tag.setSearchKey &&
          tag.isIncluded &&
          this.searchQuery === tag.setSearchKey
        ) {
          this.searchQuery = '';
          tag.isIncluded = false;
        }
      });
    }

    this.currentPage = 0;
    this.loadBuyOptions();
  }

  list() {
    this.gameService.sendCommandString(
      `#${this.marketInfo.npcUUID}, sell ${this.sellValue}`,
    );
  }

  cancel(listing: IMarketListing) {
    this.modalService
      .confirm(
        'Cancel Listing',
        'Are you sure you want to cancel this listing? You will not get the listing fee back!',
      )
      .subscribe((res) => {
        if (!res) return;
        this.gameService.sendCommandString(
          `#${this.marketInfo.npcUUID}, buy ${(listing as any)._id}`,
        );
        this.myListings = this.myListings.filter((x) => x !== listing);
      });
  }

  buy(listing: IMarketListing) {
    this.modalService
      .confirm(
        'Buy Item',
        `Are you sure you want to buy ${
          listing.itemId
        } for ${listing.listingInfo.price.toLocaleString()} gold?`,
      )
      .subscribe((res) => {
        if (!res) return;
        this.gameService.sendCommandString(
          `#${this.marketInfo.npcUUID}, buy ${(listing as any)._id}`,
        );
        this.buyableListings = this.buyableListings.filter(
          (x) => x !== listing,
        );
      });
  }

  take(pickup: IMarketPickup) {
    this.gameService.sendCommandString(
      `#${this.marketInfo.npcUUID}, take ${(pickup as any)._id}`,
    );
    this.myPickups = this.myPickups.filter((x) => x !== pickup);
  }
}
