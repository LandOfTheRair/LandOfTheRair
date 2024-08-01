import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngxs/store';

import { isUndefined } from 'lodash';

import { timer } from 'rxjs';
import {
  Allegiance,
  GameServerResponse,
  Hostility,
  ICharacter,
  INPC,
  IPlayer,
  ItemSlot,
} from '../../../../interfaces';
import {
  GameState,
  SetCurrentCommand,
  SetCurrentTarget,
  SettingsState,
  ViewCharacterEquipment,
} from '../../../../stores';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../../services/game.service';
import { MacrosService } from '../../../services/macros.service';
import { OptionsService } from '../../../services/options.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
})
export class CharacterListComponent implements OnInit, OnDestroy {
  public player = select(GameState.player);
  public characters = select(GameState.allCharacters);
  public curPos = select(GameState.currentPosition);
  public command = select(SettingsState.currentCommand);
  public macro = select(MacrosService.currentPlayerActiveMacro);

  public disableInteractions = false;

  private store = inject(Store);
  private socketService = inject(SocketService);
  private optionsService = inject(OptionsService);
  public gameService = inject(GameService);

  constructor() {
    timer(0, 500)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.gameService.updateCharacterList(this.player()));

    effect(() => {
      this.curPos();
      this.gameService.updateCharacterList(this.player());
    });
  }

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
    if (this.disableInteractions) return;

    // can't interact with the dead
    if (char.hp.current <= 0) return;

    // if they're not green, we can target them for future interactions
    if ((char as INPC).hostility !== Hostility.Never) {
      this.store.dispatch(new SetCurrentTarget(char.uuid));
    }

    // only select the target if we hit ctrl
    if ($event?.ctrlKey) return;

    // disable ui interactions for a bit so we don't spam
    this.disableInteractions = true;
    setTimeout(() => {
      this.disableInteractions = false;
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
      this.gameService.hostilityLevelFor(this.player(), char) !== 'hostile'
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
