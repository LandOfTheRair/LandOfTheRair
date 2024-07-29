import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Holiday, IDynamicEvent } from '../../../../interfaces';
import { GameState, LobbyState } from '../../../../stores';

import * as holidayDescs from '../../../../assets/content/_output/holidaydescs.json';

@Component({
  selector: 'app-currentevents',
  templateUrl: './currentevents.component.html',
  styleUrls: ['./currentevents.component.scss'],
})
export class CurrentEventsComponent {
  @Select(GameState.currentHoliday) holiday$: Observable<Holiday>;
  @Select(LobbyState.events) events$: Observable<IDynamicEvent[]>;

  public get holidayDescs() {
    return holidayDescs;
  }

  constructor(public dialogRef: MatDialogRef<CurrentEventsComponent>) {}

  // format the stat string nicely
  public statString(event: IDynamicEvent): string {
    return Object.keys(event.statBoost || {})
      .map((stat) => {
        if (!event.statBoost[stat]) return '';

        let statDisplay = stat.toUpperCase();
        const isPercent = statDisplay.includes('PERCENT');
        if (isPercent) statDisplay = statDisplay.split('PERCENT')[0];
        statDisplay = statDisplay.split('BONUS')[0];

        return `+${event.statBoost[stat]}${
          isPercent ? '%' : ''
        } ${statDisplay}`;
      })
      .filter(Boolean)
      .join(', ');
  }
}
