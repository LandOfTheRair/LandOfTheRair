import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { GameServerEvent, ICharacterCreateInfo } from '../../../../models';
import { SetActiveWindow, SetCharSlot } from '../../../../stores';
import { AssetService } from '../../../asset.service';
import { GameService } from '../../../game.service';
import { SocketService } from '../../../socket.service';
import { CharCreateComponent } from '../char-create/char-create.component';

@Component({
  selector: 'app-char-select',
  templateUrl: './char-select.component.html',
  styleUrls: ['./char-select.component.scss']
})
export class CharSelectComponent implements OnInit, OnDestroy {

  constructor(
    private store: Store,
    private dialog: MatDialog,
    public gameService: GameService,
    public socketService: SocketService,
    public assetService: AssetService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks(this.constructor.name);
  }

  public setCharSlot(event) {
    this.store.dispatch(new SetCharSlot(event.value));
  }

  create(charCreateData: ICharacterCreateInfo, slot: number, needsOverwrite: boolean) {
    const dialogRef = this.dialog.open(CharCreateComponent, {
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
