import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { isUndefined } from 'lodash';

import { combineLatest, Observable, Subscription, timer } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  Allegiance,
  GameServerResponse,
  Hostility,
  ICharacter,
  IMacro,
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
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.allCharacters) characters$: Observable<ICharacter[]>;
  @Select(GameState.currentPosition) pos$: Observable<{ x: number; y: number }>;
  @Select(SettingsState.currentCommand) command$: Observable<string>;
  @Select(MacrosService.currentPlayerActiveMacro) macro$: Observable<IMacro>;

  playerSub: Subscription;
  timerSub: Subscription;
  moveSub: Subscription;

  public player: IPlayer;

  public disableInteractions = false;

  constructor(
    private store: Store,
    private socketService: SocketService,
    private optionsService: OptionsService,
    public gameService: GameService,
  ) {
    this.playerSub = this.player$
      .pipe(takeUntilDestroyed())
      .subscribe((p) => (this.player = p));

    this.timerSub = timer(0, 500)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.gameService.updateCharacterList(this.player));
    this.moveSub = this.pos$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.gameService.updateCharacterList(this.player));
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

    combineLatest([this.command$, this.macro$])
      .pipe(first())
      .subscribe(([cmd, macro]) => {
        if ((char as INPC).hostility === Hostility.Never) {
          this.gameService.sendCommandString(`${char.uuid}, hello`);
        } else if (
          (char as INPC).hostility === Hostility.OnHit &&
          (char as INPC).allegiance !== Allegiance.NaturalResource &&
          !char.agro[this.player.uuid] &&
          !this.player.agro[char.uuid] &&
          this.optionsService.dontAttackGreys
        ) {
          this.store.dispatch(new SetCurrentCommand(`${char.name}, `));
        } else if (
          (char as IPlayer).username &&
          !cmd &&
          this.gameService.hostilityLevelFor(this.player, char) !== 'hostile'
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
      });
  }

  public doAltAction(player: ICharacter, char: ICharacter, $event?: any) {
    $event?.preventDefault();
    $event?.stopPropagation();

    // we can view characters loadouts
    if ((char as IPlayer).username) {
      this.store.dispatch(new ViewCharacterEquipment(char));
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
