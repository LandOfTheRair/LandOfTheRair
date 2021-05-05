import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { cloneDeep, debounce, get, startCase } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { calculateListingFee, EquippableItemClasses, IMarketItemInfo, IMarketListing, IMarketPickup, IPlayer,
  ItemClass, itemListError, ItemSlot, listingFeePercent, WeaponClasses } from '../../../../interfaces';
import { GameState, HideMarketWindow, HideWindow } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';

import { GameService } from '../../../services/game.service';
import { ModalService } from '../../../services/modal.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit, OnDestroy {

  @Select(GameState.currentPosition) curPos$: Observable<{ x: number; y: number }>;
  @Select(GameState.currentMarketWindow) market$: Observable<any>;
  @Select(GameState.inGame) inGame$: Observable<any>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  private lastPos = { x: 0, y: 0 };
  public marketInfo: any = {};
  public player: IPlayer;
  public isLoading = false;

  marketInfoSub: Subscription;
  posSub: Subscription;
  gameStatusSub: Subscription;
  playerSub: Subscription;

  public searchQuery = '';
  public sellValue = 1;

  public currentPage = 0;
  public currentSort: any;
  public currentTab: string;
  public debouncedSearch = debounce(() => this.changeSearchText(), 200);

  public buyableListings: IMarketListing[];
  public myListings: IMarketListing[];
  public myPickups: IMarketPickup[];

  public tabs = ['Buy', 'Sell', 'My Listings', 'Pick Up'];

  public sortOptions = [
    { name: 'Most Recent',        sort: 'mostrecent' },
    { name: 'Least Recent',       sort: 'leastrecent' },
    { name: 'Price: Low to High', sort: 'lowtohigh' },
    { name: 'Price: High to Low', sort: 'hightolow' }
  ];

  public filterTags: Array<{ name: string; includedTypes: string[]; isIncluded?: boolean; setSearchKey?: string }> = [
    { name: 'Bottles',        includedTypes: [ItemClass.Bottle] },
    { name: 'Cosmetics',      includedTypes: [ItemClass.Scroll], setSearchKey: 'Cosmetic' },
    { name: 'Food',           includedTypes: [ItemClass.Food] },
    { name: 'Gear',           includedTypes: EquippableItemClasses },
    { name: 'Gems',           includedTypes: [ItemClass.Gem] },
    { name: 'Misc',           includedTypes: [ItemClass.Box, ItemClass.Book, ItemClass.Key, ItemClass.Skull] },
    { name: 'Reagents',       includedTypes: [ItemClass.Flower, ItemClass.Rock, ItemClass.Twig] },
    { name: 'Rings',          includedTypes: [ItemClass.Ring] },
    { name: 'Scrolls',        includedTypes: [ItemClass.Scroll] },
    { name: 'Traps',          includedTypes: [ItemClass.Trap] },
    { name: 'Weapons',        includedTypes: WeaponClasses }
  ];

  public get listingFeePercent() {
    return listingFeePercent() * 100;
  }

  public get listingFee(): number {
    if (!this.player) return 0;

    const item = this.player.items.equipment[ItemSlot.RightHand];
    if (!item) return 0;

    const realItem = this.assetService.getItem(item.name);
    if (!realItem) return 0;

    return calculateListingFee(realItem, this.sellValue);
  }

  public get sellError(): string {
    if (!this.player) return '';

    const item = this.player.items.equipment[ItemSlot.RightHand];
    if (!item) return 'You need to hold an item to sell.';

    const realItem = this.assetService.getItem(item.name);
    if (!realItem) return 'That item is too unique to sell.';

    return itemListError(this.player, item, realItem, this.sellValue);
  }

  public get canGoBack() {
    return this.currentPage !== 0;
  }

  public get canGoForward() {
    return this.buyableListings.length > 0;
  }

  constructor(
    private http: HttpClient,
    private store: Store,
    private assetService: AssetService,
    private modalService: ModalService,
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.posSub = this.curPos$.subscribe((pos) => {
      if (!pos) return;
      if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;

      if (this.marketInfo.npcUUID) {
        this.store.dispatch(new HideMarketWindow());
        this.store.dispatch(new HideWindow('market'));
      }
    });

    this.marketInfoSub = this.market$.subscribe(data => {
      this.marketInfo = cloneDeep(data || {});
    });

    this.gameStatusSub = this.inGame$.subscribe(() => {
      this.store.dispatch(new HideMarketWindow());
      this.store.dispatch(new HideWindow('market'));
    });

    this.playerSub = this.player$.subscribe(p => {
      if (!p) return;
      this.player = p;

      if (this.currentTab) return;
      this.switchTab('Buy');
    });

  }

  ngOnDestroy() {}

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

    this.http.get(environment.server.http + `/market/listings/all`, {
      params: {
        search: this.searchQuery,
        page: this.currentPage.toString(),
        sort: this.currentSort,
        filter: this.filterTags.filter(x => x.isIncluded).map(x => x.includedTypes).flat().join(',')
      }
    })
      .subscribe(d => {
        this.buyableListings = (d as IMarketListing[]) || [];
        this.isLoading = false;
      });
  }

  loadMyListings() {
    if (!this.player) return;

    this.isLoading = true;

    this.http.get(environment.server.http + `/market/listings/mine?username=${this.player.username}`)
      .subscribe(d => {
        this.myListings = (d as IMarketListing[]) || [];
        this.isLoading = false;
      });
  }

  loadMyPickups() {
    if (!this.player) return;

    this.http.get(environment.server.http + `/market/pickups/mine?username=${this.player.username}`)
      .subscribe(d => {
        this.myPickups = (d as IMarketPickup[]) || [];
        this.isLoading = false;
      });
  }

  public starTextFor(itemInfo: IMarketItemInfo) {
    const quality = get(itemInfo, 'itemOverride.quality', 0);
    return quality - 2 > 0 ? Array(quality - 2).fill('★').join('') : '';
  }

  public statStringFor(itemInfo: IMarketItemInfo) {
    const stats = get(itemInfo, 'itemOverride.stats', {});
    const statKeys = Object.keys(stats);
    if (statKeys.length === 0) return '';
    return statKeys.map(stat => `${stats[stat] < 0 ? '' : '+'}${stats[stat]} ${stat.toUpperCase()}`).filter(Boolean).join(', ');
  }

  public traitStringFor(itemInfo: IMarketItemInfo) {
    const trait = get(itemInfo, 'itemOverride.trait', { name: '', level: '' });
    if (!trait || !trait.name || !trait.level) return '';

    const levelStrings = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return `${startCase(trait.name)} ${levelStrings[trait.level] ?? '?'}`;
  }

  public effectStringFor(itemInfo: IMarketItemInfo) {
    const effect = itemInfo.itemOverride.useEffect
                || itemInfo.itemOverride.trapEffect
                || itemInfo.itemOverride.equipEffect
                || itemInfo.itemOverride.strikeEffect;

    if (!effect || !effect.name || !effect.potency) return '';
    if (effect.name.includes('Permanent') || effect.name.includes('Fill') || effect.name.includes('Nourishment')) return '';

    return `${startCase(effect.name)} (Str. ${effect.potency})`;
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
        this.filterTags.forEach(tag => tag.isIncluded = tag.setSearchKey === filter.setSearchKey);
        this.searchQuery = filter.setSearchKey;
      } else {
        this.searchQuery = '';
      }
    } else {
      this.filterTags.forEach(tag => {
        if (tag.setSearchKey && tag.isIncluded && this.searchQuery === tag.setSearchKey) {
          this.searchQuery = '';
          tag.isIncluded = false;
        }
      });
    }

    this.currentPage = 0;
    this.loadBuyOptions();
  }

  list() {
    this.gameService.sendCommandString(`#${this.marketInfo.npcUUID}, sell ${this.sellValue}`);
  }

  cancel(listing: IMarketListing) {
    this.modalService.confirm('Cancel Listing', 'Are you sure you want to cancel this listing? You will not get the listing fee back!')
      .subscribe(res => {
        if (!res) return;
        this.gameService.sendCommandString(`#${this.marketInfo.npcUUID}, buy ${(listing as any)._id}`);
        this.myListings = this.myListings.filter(x => x !== listing);
      });
  }

  buy(listing: IMarketListing) {
    this.modalService.confirm(
      'Buy Item', `Are you sure you want to buy ${listing.itemId} for ${listing.listingInfo.price.toLocaleString()} gold?`
    )
      .subscribe(res => {
        if (!res) return;
        this.gameService.sendCommandString(`#${this.marketInfo.npcUUID}, buy ${(listing as any)._id}`);
        this.buyableListings = this.buyableListings.filter(x => x !== listing);
      });
  }

  take(pickup: IMarketPickup) {
    this.gameService.sendCommandString(`#${this.marketInfo.npcUUID}, take ${(pickup as any)._id}`);
    this.myPickups = this.myPickups.filter(x => x !== pickup);
  }

}
