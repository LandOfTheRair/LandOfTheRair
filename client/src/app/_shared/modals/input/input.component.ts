import { Component, Inject } from '@angular/core';
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
})
export class InputModalComponent {
  public value = '';

  constructor(
    public dialogRef: MatDialogRef<InputModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IInputData,
  ) {}
}
