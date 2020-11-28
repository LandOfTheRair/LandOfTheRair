import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { GameServerEvent, GameServerResponse, IDialogChatAction, IMacro, IMacroBar } from '../../interfaces';
import { GameState } from '../../stores';

import { AboutComponent } from '../_shared/modals/about/about.component';
import { AccountComponent } from '../_shared/modals/account/account.component';
import { AlertComponent } from '../_shared/modals/alert/alert.component';
import { AmountModalComponent } from '../_shared/modals/amount/amount.component';
import { ConfirmModalComponent } from '../_shared/modals/confirm/confirm.component';
import { CurrentEventsComponent } from '../_shared/modals/currentevents/currentevents.component';
import { DialogComponent } from '../_shared/modals/dialog/dialog.component';
import { MacroEditorComponent } from '../_shared/modals/macroeditor/macroeditor.component';
import { ManageSilverComponent } from '../_shared/modals/managesilver/managesilver.component';
import { NewSpellsComponent } from '../_shared/modals/newspells/newspells.component';
import { OptionsComponent } from '../_shared/modals/options/options.component';
import { TextModalComponent } from '../_shared/modals/text/text.component';
import { OptionsService } from './options.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  @Select(GameState.inGame) inGame$: Observable<boolean>;
  private npcDialogRef: MatDialogRef<DialogComponent>;
  private spellDialogRef: MatDialogRef<NewSpellsComponent>;

  constructor(
    private socketService: SocketService,
    private optionsService: OptionsService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  public init() {
    this.inGame$.subscribe(val => {
      if (!val && this.npcDialogRef) {
        this.npcDialogRef.close();
      }
    });

    this.socketService.wsConnected$.subscribe(val => {
      if (val) return;

      this.dialog.closeAll();
    });

    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.Error,
      (data) => this.notifyError(data.error)
    );

    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.SendNotification,
      (data) => this.notify(data.message)
    );

    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.SendAlert,
      (data) => this.alert(data.title, data.content, data.extraData)
    );

    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.SendConfirm,
      (data) => {
        const confirm = this.confirm(data.title, data.content, data.extraData);
        confirm.subscribe(choice => {
          if (!choice) return;
          this.socketService.emit(GameServerEvent.DoCommand, data.okAction);
        });
      }
    );
  }

  public notify(text: string) {
    return this.snackbar.open(text, 'Close', {
      panelClass: ['fancy', 'normal'],
      duration: 3000
    });
  }

  public notifyError(text: string) {
    return this.snackbar.open(text, 'Close', {
      panelClass: ['fancy', 'error'],
      duration: 3000
    });
  }

  public alert(title: string, content: string, extraData = {}) {
    this.dialog.open(AlertComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content, extraData }
    });
  }

  public confirm(title: string, content: string, extraData = {}) {
    const confirm = this.dialog.open(ConfirmModalComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content, extraData }
    });

    return confirm.afterClosed();
  }

  public amount(title: string, content: string, max: number) {
    const amount = this.dialog.open(AmountModalComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content, max }
    });

    return amount.afterClosed();
  }

  public text(title: string, content: string) {
    const text = this.dialog.open(TextModalComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content }
    });

    return text.afterClosed();
  }

  public newSpells(newSpells: IMacro[], macroBars: IMacroBar[]) {
    if(this.spellDialogRef) return this.spellDialogRef.afterClosed();

    this.spellDialogRef = this.dialog.open(NewSpellsComponent, {
      width: '450px',
      panelClass: 'fancy',
      disableClose: true,
      data: { newSpells, macroBars }
    });

    this.spellDialogRef.afterClosed().subscribe(() => {
      this.spellDialogRef = null;
    });

    return this.spellDialogRef.afterClosed();
  }

  public npcDialog(dialogInfo: IDialogChatAction) {
    if (this.npcDialogRef || this.optionsService.classicNPCChat) return null;

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

  public showAbout() {
    this.dialog.open(AboutComponent, {
      width: '650px',
      panelClass: 'fancy'
    });
  }

  public showAccount() {
    this.dialog.open(AccountComponent, {
      width: '650px',
      panelClass: 'fancy'
    });
  }

  public showCurrentEvents() {
    this.dialog.open(CurrentEventsComponent, {
      width: '650px',
      panelClass: 'fancy'
    });
  }

  public showManageSilver() {
    this.dialog.open(ManageSilverComponent, {
      width: '650px',
      panelClass: 'fancy'
    });
  }

  public showOptions() {
    this.dialog.open(OptionsComponent, {
      width: '650px',
      panelClass: 'fancy'
    });
  }

  public showMacros() {
    this.dialog.open(MacroEditorComponent, {
      width: '750px',
      panelClass: 'fancy',
      disableClose: true,
      data: { modals: this }
    });
  }
}
