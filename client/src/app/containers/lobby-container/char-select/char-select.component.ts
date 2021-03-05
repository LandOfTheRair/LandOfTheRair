import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngxs/store';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { combineLatest, Subscription } from 'rxjs';
import { GameServerEvent, IAccount, ICharacterCreateInfo, IPlayer, basePlayerSprite } from '../../../../interfaces';
import { SetActiveWindow, SetCharSlot } from '../../../../stores';
import { AssetService } from '../../../services/asset.service';
import { GameService } from '../../../services/game.service';
import { SocketService } from '../../../services/socket.service';
import { CharCreateComponent } from '../char-create/char-create.component';

@AutoUnsubscribe()
@Component({
  selector: 'app-char-select',
  templateUrl: './char-select.component.html',
  styleUrls: ['./char-select.component.scss']
})
export class CharSelectComponent implements AfterViewInit, OnDestroy {

  @ViewChild('tabs', { static: false }) tabs: MatTabGroup;
  public account: IAccount;
  public charSlot: number;
  public charSlotAccount$: Subscription;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    public gameService: GameService,
    public socketService: SocketService,
    public assetService: AssetService
  ) { }

  ngAfterViewInit() {
    this.charSlotAccount$ = combineLatest([
      this.gameService.account$,
      this.gameService.charSlot$
    ]).subscribe(([account, charSlot]) => {

      // we don't talk about this mess
      setTimeout(() => {
        this.account = account;
        this.charSlot = charSlot.slot;
      }, 0);
    });
  }

  ngOnDestroy() {
  }

  public setCharSlot(index) {
    this.store.dispatch(new SetCharSlot(index));
  }

  public spriteForPlayer(player: IPlayer): number {
    return basePlayerSprite(player);
  }

  create(charCreateData: ICharacterCreateInfo, slot: number, needsOverwrite: boolean) {
    const dialogRef = this.dialog.open(CharCreateComponent, {
      panelClass: 'fancy',
      disableClose: true,
      data: { needsOverwrite, slot, charCreateData }
    });

    dialogRef.afterClosed().subscribe(char => {
      if (!char) return;
      this.socketService.emit(GameServerEvent.CreateCharacter, { slot, ...char });
    });
  }

  play(charSlot: number) {
    this.socketService.emit(GameServerEvent.PlayCharacter, { charSlot });
    this.store.dispatch(new SetActiveWindow('map'));
  }

}
