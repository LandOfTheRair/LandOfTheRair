import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DateTime } from 'luxon';

import { LobbyState } from '../../../../stores';
import { ISessionStatistics } from '../../../../interfaces';

@Component({
  selector: 'app-session-stats',
  templateUrl: './session-stats.component.html',
  styleUrls: ['./session-stats.component.scss']
})
export class SessionStatsComponent {

  @Select(LobbyState.lastSessionStats) stats$: Observable<ISessionStatistics>;

  public duration(start: number, end: number): string {
    const startDate = DateTime.fromMillis(start);
    const endDate = DateTime.fromMillis(end);

    const diff = endDate.diff(startDate);

    return diff.toFormat('hh:mm:ss');
  }

  public keysForStats(stats: ISessionStatistics) {
    return Object.keys(stats.statistics).filter(x => stats.statistics[x] > 0);
  }

}
