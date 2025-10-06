import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  styleUrls: ['./amount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountModalComponent {
  public dialogRef = inject(MatDialogRef<AmountModalComponent>);
  public data: IAmountData = inject(MAT_DIALOG_DATA);
  public amount: number;

  finish() {
    this.dialogRef.close(this.amount);
  }
}
