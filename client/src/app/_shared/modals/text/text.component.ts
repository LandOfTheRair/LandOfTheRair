import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface IAmountData {
  title: string;
  content: string;

  okText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextModalComponent {
  public text: string;

  constructor(
    public dialogRef: MatDialogRef<TextModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAmountData,
  ) {}

  finish() {
    this.dialogRef.close(this.text);
  }
}
