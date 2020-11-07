import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-currentevents',
  templateUrl: './currentevents.component.html',
  styleUrls: ['./currentevents.component.scss']
})
export class CurrentEventsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CurrentEventsComponent>
  ) { }

  ngOnInit() {
  }

}
