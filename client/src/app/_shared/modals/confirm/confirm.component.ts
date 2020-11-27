import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface IConfirmData {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
  extraData: any;
}

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConfirmData
  ) { }

  ngOnInit() {
  }

}
