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
import { InputModalComponent } from '../_shared/modals/input/input.component';
import { CurrentEventsComponent } from '../_shared/modals/currentevents/currentevents.component';
import { DialogComponent } from '../_shared/modals/dialog/dialog.component';
import { MacroEditorComponent } from '../_shared/modals/macroeditor/macroeditor.component';
import { ManageSilverComponent } from '../_shared/modals/managesilver/managesilver.component';
import { NewSpellsComponent } from '../_shared/modals/newspells/newspells.component';
import { OptionsComponent } from '../_shared/modals/options/options.component';
import { TextModalComponent } from '../_shared/modals/text/text.component';
import { ErrorLogComponent } from '../_shared/modals/error-log/error-log.component';
import { OptionsService } from './options.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  @Select(GameState.inGame) inGame$: Observable<boolean>;
  private commandDialogRef: MatDialogRef<DialogComponent>;
  private spellDialogRef: MatDialogRef<NewSpellsComponent>;

  constructor(
    private socketService: SocketService,
    private optionsService: OptionsService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  public init() {
    this.inGame$.subscribe(val => {
      if (!val && this.commandDialogRef) {
        this.commandDialogRef.close();
      }
    });

    this.socketService.wsConnected$.subscribe(val => {
      if (val) return;

      this.dialog.closeAll();
    });

    this.socketService.registerComponentCallback(
      'Modal', GameServerResponse.Error,
      (data) => this.notifyError(data.error)
    );

    this.socketService.registerComponentCallback(
      'Modal', GameServerResponse.SendNotification,
      (data) => this.notify(data.message)
    );

    this.socketService.registerComponentCallback(
      'Modal', GameServerResponse.SendImportantNotification,
      (data) => this.notifyImportant(data.message)
    );

    this.socketService.registerComponentCallback(
      'Modal', GameServerResponse.SendAlert,
      (data) => this.alert(data.title, data.content, data.extraData)
    );

    this.socketService.registerComponentCallback(
      'Modal', GameServerResponse.SendConfirm,
      (data) => {
        const confirm = this.confirm(data.title, data.content, data.extraData);
        confirm.subscribe(choice => {
          if (!choice) return;
          this.socketService.emit(GameServerEvent.DoCommand, data.okAction);
        });
      }
    );

    this.socketService.registerComponentCallback(
      'Modal', GameServerResponse.SendInput,
      (data) => {
        const input = this.input(data.title, data.content, data.extraData);
        input.subscribe(value => {
          if (!value) return;

          const args = data.okAction?.args.split('$value').join(value);
          this.socketService.emit(GameServerEvent.DoCommand, { command: 'memorize', args });
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

  public notifyImportant(text: string) {
    return this.snackbar.open(text, 'Close', {
      panelClass: ['fancy', 'normal']
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

  public input(title: string, content: string, extraData = {}) {
    const input = this.dialog.open(InputModalComponent, {
      width: '450px',
      panelClass: 'fancy',
      data: { title, content, extraData }
    });

    return input.afterClosed();
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
    if (this.spellDialogRef) return this.spellDialogRef.afterClosed();

    this.spellDialogRef = this.dialog.open(NewSpellsComponent, {
      width: '650px',
      panelClass: 'fancy',
      disableClose: true,
      data: { newSpells, macroBars }
    });

    this.spellDialogRef.afterClosed().subscribe(() => {
      this.spellDialogRef = null;
    });

    return this.spellDialogRef.afterClosed();
  }

  public commandDialog(dialogInfo: IDialogChatAction) {
    if (this.commandDialogRef) return null;
    if ((dialogInfo.displayNPCName || dialogInfo.displayNPCUUID) && this.optionsService.classicNPCChat) return null;

    dialogInfo.extraClasses ??= [];
    if (dialogInfo.options.length > 5) dialogInfo.extraClasses.push('multi-column-options');

    console.log(dialogInfo);

    this.commandDialogRef = this.dialog.open(DialogComponent, {
      width: dialogInfo.width ?? '450px',
      panelClass: ['fancy', ...dialogInfo.extraClasses],
      data: dialogInfo
    });

    this.commandDialogRef.afterClosed().subscribe(() => {
      this.commandDialogRef = null;
    });

    return this.commandDialogRef.afterClosed();
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

  public showErrorLog() {
    this.dialog.open(ErrorLogComponent, {
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
