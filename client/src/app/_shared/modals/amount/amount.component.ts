import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface IAmountData {
  title: string;
  content: string;

  max: number;

  okText?: string;
  cancelText?: string;
  maxText?: string;
}

@Component({
  selector: 'app-amount',
  templateUrl: './amount.component.html',
  styleUrls: ['./amount.component.scss']
})
export class AmountModalComponent implements OnInit {

  public amount: number;

  constructor(
    public dialogRef: MatDialogRef<AmountModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAmountData
  ) { }

  ngOnInit() {
  }

  finish() {
    this.dialogRef.close(this.amount);
  }

}
