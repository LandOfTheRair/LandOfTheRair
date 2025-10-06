import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IAchievement } from '@lotr/interfaces';

@Component({
  selector: 'app-earned-achievement',
  templateUrl: './earned-achievement.component.html',
  styleUrls: ['./earned-achievement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarnedAchievementComponent {
  public achievement = input.required<IAchievement>();
  public earnedAt = input<number>();
}
