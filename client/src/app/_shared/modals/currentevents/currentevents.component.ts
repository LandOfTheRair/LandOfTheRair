import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IDynamicEvent } from '../../../../interfaces';
import { LobbyState } from '../../../../stores';

@Component({
  selector: 'app-currentevents',
  templateUrl: './currentevents.component.html',
  styleUrls: ['./currentevents.component.scss']
})
export class CurrentEventsComponent implements OnInit {

  @Select(LobbyState.events) events$: Observable<IDynamicEvent>;

  constructor(
    public dialogRef: MatDialogRef<CurrentEventsComponent>
  ) { }

  ngOnInit() {
  }

  // format the stat string nicely
  public statString(event: IDynamicEvent): string {
    return Object.keys(event.statBoost || {}).map(stat => {
      if(!event.statBoost[stat]) return '';

      let statDisplay = stat.toUpperCase();
      const isPercent = statDisplay.includes('PERCENT');
      if(isPercent) statDisplay = statDisplay.split('PERCENT')[0];
      statDisplay = statDisplay.split('BONUS')[0];

      return `+${event.statBoost[stat]}${isPercent ? '%' : ''} ${statDisplay}`;
    }).filter(Boolean).join(', ');
  }

}
