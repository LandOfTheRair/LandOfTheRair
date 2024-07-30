import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface IAlertData {
  title: string;
  content: string;
  extraData?: any;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  public dialogRef = inject(MatDialogRef<AlertComponent>);
  public data: IAlertData = inject(MAT_DIALOG_DATA);
}
