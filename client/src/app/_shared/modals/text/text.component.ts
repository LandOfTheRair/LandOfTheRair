import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface IAmountData {
  title: string;
  content: string;

  okText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextModalComponent implements OnInit {

  public text: string;

  constructor(
    public dialogRef: MatDialogRef<TextModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAmountData
  ) { }

  ngOnInit() {
  }

  finish() {
    this.dialogRef.close(this.text);
  }

}
