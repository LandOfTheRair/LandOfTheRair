import { Component, inject } from '@angular/core';
import { Select } from '@ngxs/store';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';

import { IPlayer, IQuest } from '../../../../interfaces';
import { GameState, SettingsState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import * as allQuests from '../../../../assets/content/_output/quests.json';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html',
  styleUrls: ['./quests.component.scss'],
})
export class QuestsComponent {
  @Select(SettingsState.activeWindow) public activeWindow$: Observable<string>;
  @Select(GameState.player) player$: Observable<IPlayer>;

  playerSub: Subscription;

  public player: IPlayer;

  public get questHash() {
    return allQuests;
  }

  public gameService = inject(GameService);
  
  constructor() {
    this.playerSub = this.player$
      .pipe(takeUntilDestroyed())
      .subscribe((p) => this.setPlayer(p));
  }

  private setPlayer(player: IPlayer) {
    this.player = player;
  }

  public getQuest(name: string): IQuest {
    return this.questHash[name];
  }
}
