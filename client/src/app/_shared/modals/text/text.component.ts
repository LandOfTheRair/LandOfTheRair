import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextModalComponent {
  public dialogRef = inject(MatDialogRef<TextModalComponent>);
  public data: IAmountData = inject(MAT_DIALOG_DATA);

  public text: string;

  finish() {
    this.dialogRef.close(this.text);
  }
}
