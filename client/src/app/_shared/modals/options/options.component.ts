import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { select, Store } from '@ngxs/store';
import { GameOption } from '../../../../interfaces';
import {
  SetAllWindowPositions,
  SetOption,
  SettingsState,
} from '../../../../stores';
import { OptionsService } from '../../../services/options.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  public allWindowPositions = select(SettingsState.allWindowPositions);

  private store = inject(Store);
  private optionsService = inject(OptionsService);
  public dialogRef = inject(MatDialogRef<OptionsComponent>);
  public optionsSelector = select(SettingsState.options);

  public options: any = {};

  public readonly debugOptions = [
    { option: GameOption.DebugUI, text: 'Show debug info in the interface' },
  ];

  public readonly interactionOptions = [
    {
      option: GameOption.RightClickCMDSend,
      text: 'Right-click to send command line',
    },
    {
      option: GameOption.EnterToggleCMD,
      text: 'Use Enter to toggle command line visibility',
    },
    {
      option: GameOption.NoNPCModals,
      text: 'Classic NPC chat (no dialog popups)',
    },
    {
      option: GameOption.AutoAttack,
      text: 'Auto-attack while there is an active target',
    },
    {
      option: GameOption.AutoJoin,
      text: 'Join the game with the last character used',
    },
    {
      option: GameOption.DontAttackGreys,
      text: 'Do not attack grey-tags automatically',
    },
  ];

  public readonly messageOptions = [
    {
      option: GameOption.HideLobbyWhilePlaying,
      text: 'Hide lobby while in game',
    },
    {
      option: GameOption.SuppressZeroDamage,
      text: 'Suppress 0-damage messages',
    },
    {
      option: GameOption.SuppressOutgoingDoT,
      text: 'Suppress outgoing DoT damage',
    },
    {
      option: GameOption.SendBannerMessagesToChat,
      text: 'Send banner messages to chat window as well as banner',
    },
  ];

  public readonly uiOptions = [
    { option: GameOption.LockWindows, text: 'Lock all window positions' },
    { option: GameOption.NoItemAnimations, text: 'Stop item animations' },
    {
      option: GameOption.ShrinkCharacterBoxes,
      text: 'Shrink character boxes to health + name only',
    },
    {
      option: GameOption.LockerTabs,
      text: 'Locker will be tabs instead of dropdown',
    },
    {
      option: GameOption.BiggerGroundWindow,
      text: 'Ground will be 2 rows on top and bottom',
    },
    {
      option: GameOption.ShowHPValueInsteadOfPercent,
      text: 'Show HP value instead of percent',
    },
    // { option: GameOption.PinLastTarget,            text: 'Pin last target click position' },
  ];

  public readonly spritesheets = [
    'Decor',
    'Walls',
    'Items',
    'Creatures',
    'Swimming',
    'Terrain',
    'Effects',
  ];

  constructor() {
    effect(() => {
      this.options = Object.assign({}, this.optionsSelector());
    });
  }

  public updateOption(option) {
    this.store.dispatch(
      new SetOption(option as GameOption, this.options[option]),
    );

    if (option === GameOption.CustomCSS) {
      this.optionsService.updateCustomCSS();
    }
  }

  export() {
    const fileName = `lotr-windows.json`;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(this.allWindowPositions(), null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', fileName);
    downloadAnchorNode.click();
  }

  import(e, inputEl) {
    if (!e || !e.target || !e.target.files) return;

    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (ev) => {
      const windowFile = JSON.parse((ev.target as FileReader).result as string);

      const finish = () => {
        this.store.dispatch(new SetAllWindowPositions(windowFile));
        inputEl.value = null;
      };

      finish();
    };

    reader.readAsText(file);
  }
}
