import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { select, Store } from '@ngxs/store';
import {
  basePlayerSprite,
  GameServerEvent,
  ICharacterCreateInfo,
  IPlayer,
} from '../../../../interfaces';
import {
  AccountState,
  LobbyState,
  SetActiveWindow,
  SetCharSlot,
  SetLastCharSlotPlayed,
  SettingsState,
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
  public account = select(AccountState.account);
  public charSlots = select(SettingsState.charSlot);
  public charCreateData = select(LobbyState.charCreateData);

  private store = inject(Store);
  private dialog = inject(MatDialog);
  public gameService = inject(GameService);
  public socketService = inject(SocketService);
  public assetService = inject(AssetService);

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
