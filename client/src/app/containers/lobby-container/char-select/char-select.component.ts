import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../../game.service';
import { Store } from '@ngxs/store';
import { SetCharSlot, SetCharacterCreateInformation, SetCharacterSlotInformation } from '../../../../stores';
import { MatDialog } from '@angular/material/dialog';
import { CharCreateComponent } from '../char-create/char-create.component';
import { SocketService } from '../../../socket.service';
import { GameServerEvent, GameServerResponse } from '../../../../models/events';
import { ICharacterCreateInfo } from '../../../../models';

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
    public socketService: SocketService
  ) { }

  ngOnInit() {
    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.CharacterCreateInformation,
      (data) => this.store.dispatch(new SetCharacterCreateInformation(data))
    );
    this.socketService.registerComponentCallback(
      this.constructor.name, GameServerResponse.CharacterCreate,
      (data) => this.store.dispatch(new SetCharacterSlotInformation(data, data.slot))
    );

    this.socketService.emit(GameServerEvent.CharacterCreateInformation);
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

      // TODO: doesn't work
      if (needsOverwrite) {
        this.socketService.emit(GameServerEvent.DeleteCharacter, { slot });
      }

      this.socketService.emit(GameServerEvent.CreateCharacter, { slot, ...char });
    });
  }

  play(slot: number) {
    this.socketService.emit(GameServerEvent.PlayCharacter, { slot });
  }

}
