import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface IInputData {
  title: string;
  content: string;
  extraData: {
    npcSprite?: number;
    okText?: string;
    cancelText?: string;
  };
}

@Component({
  selector: 'app-input-request',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputModalComponent {
  public dialogRef = inject(MatDialogRef<InputModalComponent>);
  public data: IInputData = inject(MAT_DIALOG_DATA);

  public value = '';
}
