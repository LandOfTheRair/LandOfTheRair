import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IDialogChatAction } from '../interfaces';
import { GameState } from '../stores';

import { AlertComponent } from './_shared/modals/alert/alert.component';
import { ConfirmModalComponent } from './_shared/modals/confirm/confirm.component';
import { DialogComponent } from './_shared/modals/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  @Select(GameState.inGame) inGame$: Observable<boolean>;
  private npcDialogRef: MatDialogRef<DialogComponent>;

  constructor(
    private dialog: MatDialog
  ) {}

  public init() {
    this.inGame$.subscribe(val => {
      if (!val && this.npcDialogRef) {
        this.npcDialogRef.close();
      }
    });
  }

  public alert(title: string, content: string) {
    this.dialog.open(AlertComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content }
    });
  }

  public confirm(title: string, content: string) {
    const confirm = this.dialog.open(ConfirmModalComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content }
    });

    return confirm.afterClosed();
  }

  public npcDialog(dialogInfo: IDialogChatAction) {
    if (this.npcDialogRef) return null;

    this.npcDialogRef = this.dialog.open(DialogComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: dialogInfo
    });

    this.npcDialogRef.afterClosed().subscribe((result) => {
      this.npcDialogRef = null;
    });

    return this.npcDialogRef.afterClosed();
  }
}
