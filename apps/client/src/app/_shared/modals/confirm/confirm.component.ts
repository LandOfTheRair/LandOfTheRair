import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface IConfirmData {
  title: string;
  content: string;
  extraData: {
    npcSprite?: number;
    okText?: string;
    cancelText?: string;
  };
}

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  public dialogRef = inject(MatDialogRef<ConfirmModalComponent>);
  public data: IConfirmData = inject(MAT_DIALOG_DATA);
}
