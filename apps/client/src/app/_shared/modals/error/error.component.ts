import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface IErrorAlertData {
  title: string;
  content: string;
}

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  public dialogRef = inject(MatDialogRef<ErrorComponent>);
  public data: IErrorAlertData = inject(MAT_DIALOG_DATA);
}
