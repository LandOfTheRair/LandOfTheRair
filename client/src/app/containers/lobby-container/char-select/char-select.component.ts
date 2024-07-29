import { Component, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngxs/store';
import { combineLatest, Subscription } from 'rxjs';
import {
  basePlayerSprite,
  GameServerEvent,
  IAccount,
  ICharacterCreateInfo,
  IPlayer,
} from '../../../../interfaces';
import {
  SetActiveWindow,
  SetCharSlot,
  SetLastCharSlotPlayed,
} from '../../../../stores';
import { AssetService } from '../../../services/asset.service';
import { GameService } from '../../../services/game.service';
import { SocketService } from '../../../services/socket.service';
import { CharCreateComponent } from '../char-create/char-create.component';

@Component({
  selector: 'app-char-select',
  templateUrl: './char-select.component.html',
  styleUrls: ['./char-select.component.scss'],
})
export class CharSelectComponent {
  @ViewChild('tabs', { static: false }) tabs: MatTabGroup;
  public account: IAccount;
  public charSlot: number;
  public charSlotAccount$: Subscription;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    public gameService: GameService,
    public socketService: SocketService,
    public assetService: AssetService,
  ) {
    this.charSlotAccount$ = combineLatest([
      this.gameService.account$,
      this.gameService.charSlot$,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([account, charSlot]) => {
        // we don't talk about this mess
        setTimeout(() => {
          this.account = account;
          this.charSlot = charSlot.slot;
        }, 0);
      });
  }

  public setCharSlot(index) {
    this.store.dispatch(new SetCharSlot(index));
  }

  public spriteForPlayer(player: IPlayer): number {
    return basePlayerSprite(player);
  }

  create(
    charCreateData: ICharacterCreateInfo,
    slot: number,
    needsOverwrite: boolean,
  ) {
    const dialogRef = this.dialog.open(CharCreateComponent, {
      panelClass: 'fancy',
      disableClose: true,
      data: { needsOverwrite, slot, charCreateData },
    });

    dialogRef.afterClosed().subscribe((char) => {
      if (!char) return;
      this.socketService.emit(GameServerEvent.CreateCharacter, {
        slot,
        ...char,
      });
    });
  }

  play(charSlot: number) {
    this.socketService.emit(GameServerEvent.PlayCharacter, { charSlot });
    this.store.dispatch(new SetActiveWindow('map'));
    this.store.dispatch(new SetLastCharSlotPlayed(charSlot));
  }
}
