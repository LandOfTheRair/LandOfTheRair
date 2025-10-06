import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { select, Store } from '@ngxs/store';

import { isUndefined } from 'lodash';

import {
  Allegiance,
  GameServerResponse,
  Hostility,
  ICharacter,
  INPC,
  IPlayer,
  ItemSlot,
} from '@lotr/interfaces';
import {
  GameState,
  SetCurrentCommand,
  SetCurrentTarget,
  SettingsState,
  ViewCharacterEquipment,
} from '../../../../stores';

import { GameService } from '../../../../app/services/game.service';
import { VisibleCharactersService } from '../../../../app/services/visiblecharacters.service';
import { hostilityLevelFor } from '../../../_shared/helpers';
import { MacrosService } from '../../../services/macros.service';
import { OptionsService } from '../../../services/options.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterListComponent implements OnInit, OnDestroy {
  public player = select(GameState.player);
  public characters = select(GameState.allCharacters);
  public curPos = select(GameState.currentPosition);
  public command = select(SettingsState.currentCommand);
  public macro = select(MacrosService.currentPlayerActiveMacro);

  public disableInteractions = signal<boolean>(false);

  private store = inject(Store);
  private socketService = inject(SocketService);
  private optionsService = inject(OptionsService);
  private gameService = inject(GameService);
  public visibleCharactersService = inject(VisibleCharactersService);

  ngOnInit() {
    this.socketService.registerComponentCallback(
      'CharacterList',
      GameServerResponse.GameLog,
      (data) => {
        if (isUndefined(data.setTarget)) return;
        this.store.dispatch(
          new SetCurrentTarget(data.setTarget, data.overrideIfOnly),
        );
      },
    );
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks('CharacterList');
  }

  public doAction(char: ICharacter, $event?: any) {
    if (this.disableInteractions()) return;

    // can't interact with the dead
    if (char.hp.current <= 0) return;

    // if they're not green, we can target them for future interactions
    if ((char as INPC).hostility !== Hostility.Never) {
      this.store.dispatch(new SetCurrentTarget(char.uuid));
    }

    // only select the target if we hit ctrl
    if ($event?.ctrlKey) return;

    // disable ui interactions for a bit so we don't spam
    this.disableInteractions.set(true);
    setTimeout(() => {
      this.disableInteractions.set(false);
    }, 250);

    const cmd = this.command();
    const macro = this.macro();

    if ((char as INPC).hostility === Hostility.Never) {
      this.gameService.sendCommandString(`${char.uuid}, hello`);
    } else if (
      (char as INPC).hostility === Hostility.OnHit &&
      (char as INPC).allegiance !== Allegiance.NaturalResource &&
      !char.agro[this.player().uuid] &&
      !this.player().agro[char.uuid] &&
      this.optionsService.dontAttackGreys
    ) {
      this.store.dispatch(new SetCurrentCommand(`${char.name}, `));
    } else if (
      (char as IPlayer).username &&
      !cmd &&
      hostilityLevelFor(this.player(), char) !== 'hostile'
    ) {
      this.store.dispatch(
        new SetCurrentCommand(`#${(char as IPlayer).name}, `),
      );
    } else if (cmd) {
      this.gameService.sendCommandString(cmd, char.uuid);
      this.store.dispatch(new SetCurrentCommand(''));
    } else if (macro) {
      this.gameService.sendCommandString(macro.macro, char.uuid);
    }
  }

  public doAltAction(player: ICharacter, char: ICharacter, $event?: any) {
    $event?.preventDefault();
    $event?.stopPropagation();

    // we can view characters loadouts
    if ((char as IPlayer).username) {
      this.store.dispatch(new ViewCharacterEquipment(char as IPlayer));
      return;
    }

    if (
      player.items.equipment[ItemSlot.RightHand]?.name === 'Halloween Basket' &&
      (char as INPC).hostility === Hostility.Never
    ) {
      this.gameService.sendCommandString(`${char.uuid}, trick or treat`);
      return;
    }

    this.doAction(char, $event);
  }
}
