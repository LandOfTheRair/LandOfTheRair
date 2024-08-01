import { Component, inject } from '@angular/core';
import { select } from '@ngxs/store';

import { IQuest } from '../../../../interfaces';
import { GameState, SettingsState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import * as allQuests from '../../../../assets/content/_output/quests.json';

@Component({
  selector: 'app-quests',
  templateUrl: './quests.component.html',
  styleUrls: ['./quests.component.scss'],
})
export class QuestsComponent {
  public activeWindow = select(SettingsState.activeWindow);
  public player = select(GameState.player);

  public get questHash() {
    return allQuests;
  }

  public gameService = inject(GameService);

  public getQuest(name: string): IQuest {
    return this.questHash[name];
  }
}
