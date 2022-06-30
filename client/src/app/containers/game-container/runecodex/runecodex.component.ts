import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import { IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { AssetService } from '../../../services/asset.service';

import * as AllTraits from '../../../../assets/content/_output/traits.json';

@AutoUnsubscribe()
@Component({
  selector: 'app-runecodex',
  templateUrl: './runecodex.component.html',
  styleUrls: ['./runecodex.component.scss']
})
export class RuneCodexComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;

  public player: IPlayer;
  public orderedRunes: string[] = [];

  public activeSlot = -1;
  public activeRune: string;

  playerSub: Subscription;

  public readonly slots = [
    {
      display: 'Level 5',
      slot: 0
    },
    {
      display: 'Level 10',
      slot: 1
    },
    {},
    {},

    {},
    {},
    {
      display: 'Level 15',
      slot: 2
    },
    {
      display: 'Level 20',
      slot: 3
    },

    {
      display: 'Level 25',
      slot: 4
    },
    {
      display: 'Level 30',
      slot: 5
    },
    {},
    {},

    {},
    {},
    {
      display: 'Level 35',
      slot: 6
    },
    {
      display: 'Level 40',
      slot: 7
    },


    {
      display: 'Level 45',
      slot: 8
    },
    {
      display: 'Level 50',
      slot: 9
    },
    {},
    {},
  ];

  constructor(
    private assetService: AssetService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.playerSub = this.player$.subscribe(p => {
      this.player = p;
      this.sortRunes();
    });
  }

  ngOnDestroy() {
  }

  private sortRunes() {
    if (!this.player) return;
    this.orderedRunes = this.player.learnedRunes.slice();
    this.orderedRunes.sort();

  }

  getTraitIcon(runescrollName: string): string {
    const item = this.assetService.getItem(runescrollName);
    if (!AllTraits[item?.trait?.name]) return 'uncertainty';
    return AllTraits[item.trait.name].icon;
  }

  getTraitLevel(runescrollName: string): string {
    const item = this.assetService.getItem(runescrollName);
    const level = item?.trait?.level ?? 0;

    const levelStrings = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    return levelStrings[level] ?? '?';
  }

  getTraitName(runescrollName: string): string {
    const item = this.assetService.getItem(runescrollName);
    if (!AllTraits[item?.trait?.name]) return 'Unknown Rune';

    return AllTraits[item.trait.name].name + ' ' + this.getTraitLevel(runescrollName);
  }

  selectSlot(slot: number) {
    if (this.activeSlot === slot) {
      this.activeSlot = -1;
      return;
    }

    this.activeSlot = slot;
  }

  selectRune(rune: string) {
    if (this.activeRune === rune) {
      this.activeRune = '';
      return;
    }

    this.activeRune = rune;
  }

  inscribe() {
    this.gameService.sendCommandString(`inscribe ${this.activeSlot} ${this.activeRune}`);
    this.activeRune = '';
    this.activeSlot = -1;
  }

}
