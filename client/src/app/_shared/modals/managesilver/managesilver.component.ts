import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-managesilver',
  templateUrl: './managesilver.component.html',
  styleUrls: ['./managesilver.component.scss']
})
export class ManageSilverComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ManageSilverComponent>
  ) { }

  ngOnInit() {
  }

}
