import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select } from '@ngxs/store';
import { DateTime } from 'luxon';

import { ISessionStatistics } from '@lotr/interfaces';
import { LobbyState } from '../../../../stores';

@Component({
  selector: 'app-session-stats',
  templateUrl: './session-stats.component.html',
  styleUrls: ['./session-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionStatsComponent {
  public stats = select(LobbyState.lastSessionStats);

  public duration(start: number, end: number): string {
    const startDate = DateTime.fromMillis(start);
    const endDate = DateTime.fromMillis(end);

    const diff = endDate.diff(startDate);

    return diff.toFormat('hh:mm:ss');
  }

  public keysForStats(stats: ISessionStatistics) {
    return Object.keys(stats.statistics).filter((x) => stats.statistics[x] > 0);
  }
}
