import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { select } from '@ngxs/store';

import { GameState, SettingsState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { IAchievement } from '@lotr/interfaces';
import { sortBy } from 'lodash';
import * as allAchievements from '../../../../assets/content/_output/achievements.json';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementsComponent {
  public activeWindow = select(SettingsState.activeWindow);
  public player = select(GameState.player);

  public gameService = inject(GameService);

  public completedAchievements = computed(() => {
    const achievements = this.player().achievements.achievements;
    return sortBy(
      Object.keys(achievements),
      (a) => -achievements[a].earnedAt,
    ).map((a) => ({
      ...allAchievements[a],
      earnedAt: achievements[a].earnedAt,
    }));
  });

  public lockedAchievements = computed(() => {
    const playerAchievements = this.player().achievements.achievements;
    return sortBy(
      Object.values(allAchievements).filter(
        (f) => !playerAchievements[f.name] && !f.hidden,
      ) as unknown as IAchievement[],
      'name',
    ).filter((f) => f.name);
  });

  public hiddenAchievements = computed(() => {
    const playerAchievements = this.player().achievements.achievements;
    return Object.values(allAchievements).filter(
      (f) => !playerAchievements[f.name] && f.hidden,
    );
  });
}
