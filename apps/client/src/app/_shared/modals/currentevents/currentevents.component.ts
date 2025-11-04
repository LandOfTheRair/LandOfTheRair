import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IDynamicEvent } from '@lotr/interfaces';
import { select } from '@ngxs/store';
import { GameState, LobbyState } from '../../../../stores';

import * as holidayDescs from '../../../../assets/content/_output/holidaydescs.json';

@Component({
  selector: 'app-currentevents',
  templateUrl: './currentevents.component.html',
  styleUrls: ['./currentevents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentEventsComponent {
  public dialogRef = inject(MatDialogRef<CurrentEventsComponent>);
  public holiday = select(GameState.currentHoliday);
  public events = select(LobbyState.events);

  public get holidayDescs() {
    return holidayDescs;
  }

  // format the stat string nicely
  public statString(event: IDynamicEvent): string {
    return Object.keys(event.statBoost || {})
      .map((stat) => {
        if (!event.statBoost[stat]) return '';

        let statDisplay = stat.toUpperCase();
        const isPercent = statDisplay.includes('PERCENT');
        if (isPercent) statDisplay = statDisplay.split('PERCENT')[0];
        statDisplay = statDisplay.split('BONUS')[0];

        if (statDisplay === 'SPAWNTICKMULTIPLIERBOOST') {
          return `+${event.statBoost[stat]}x Spawn Rate Boost`;
        }

        return `+${event.statBoost[stat]}${
          isPercent ? '%' : ''
        } ${statDisplay}`;
      })
      .filter(Boolean)
      .join(', ');
  }
}
