import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { IAchievement } from '@lotr/interfaces';

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementComponent {
  public snackbarAchievement = inject(MAT_SNACK_BAR_DATA);
  public achievement = input<IAchievement>();

  public realAchievement = computed(
    () => this.snackbarAchievement?.achievement || this.achievement(),
  );

  public isUnlock = computed(() => !!this.snackbarAchievement?.achievement);
}
