import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { createSelectMap, Store } from '@ngxs/store';

import allMacros from '../../../../assets/content/_output/macros.json';

import { IMacro, IMacroBar, IPlayer } from '@lotr/interfaces';
import {
  GameState,
  MacrosState,
  SetActiveMacro,
  SetActiveMacroBars,
  SetCurrentCommand,
} from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { MacrosService } from '../../../services/macros.service';

@Component({
  selector: 'app-macro-bar',
  templateUrl: './macro-bar.component.html',
  styleUrls: ['./macro-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacroBarComponent {
  public pageData = createSelectMap({
    player: GameState.player,
    macros: MacrosService.currentPlayerMacros,
    allMacros: MacrosState.allMacros,
    currentTarget: GameState.currentTarget,
  });

  public readonly macroArray = Array(10)
    .fill(null)
    .map((x, i) => i);

  private store = inject(Store);
  public gameService = inject(GameService);

  public operateOnMacro(player: IPlayer, macro: IMacro) {
    if (!macro || this.isMacroDisabled(player, macro)) return;

    if (macro.mode === 'lockActivation') {
      this.store.dispatch(new SetActiveMacro(macro.name));
      return;
    }

    if (macro.mode === 'autoActivate') {
      this.gameService.sendCommandString(macro.macro);
      return;
    }

    if (macro.mode === 'autoTarget') {
      const target = this.pageData.currentTarget();
      if (target) {
        this.gameService.sendCommandString(macro.macro, target.uuid);
        return;
      }

      this.store.dispatch(new SetCurrentCommand(`#${macro.macro}`));
      return;
    }

    this.store.dispatch(new SetCurrentCommand(`#${macro.macro}`));
  }

  public changeMacroGroup(
    macroBars: string[],
    allMacroBars: Record<string, IMacroBar>,
    macroBarIndex: number,
    modifier = 0,
  ) {
    const currentName = macroBars[macroBarIndex];

    const orderedMacroBars = Object.keys(allMacroBars).sort();
    const currentIndex: any = orderedMacroBars.findIndex(
      (x) => x === currentName,
    );

    let newIndex = currentIndex + modifier;
    if (newIndex === -1) newIndex = orderedMacroBars.length - 1;
    if (newIndex === orderedMacroBars.length) newIndex = 0;

    const newMacroBars = [...macroBars];
    newMacroBars[macroBarIndex] = orderedMacroBars[newIndex];

    this.store.dispatch(new SetActiveMacroBars(newMacroBars));
  }

  public macroCooldown(player: IPlayer, macro: IMacro): number {
    if (!macro?.for) return 0;
    const cooldown = player.spellCooldowns?.[macro.for] ?? 0;

    if (Date.now() > cooldown) return 0;

    return cooldown;
  }

  public isMacroDisabled(player: IPlayer, macro: IMacro): boolean {
    if (!macro?.for) return false;

    // we make this check in case they have a spell scroll that references a spell that is a default macro
    if (
      allMacros[macro.for] &&
      !player.learnedSpells[macro.for.toLowerCase()]
    ) {
      return true;
    }

    if (allMacros[macro.for]) return false;
    return (
      !player.learnedSpells[macro.for.toLowerCase()] ||
      player.spellCooldowns?.[macro.for] > Date.now()
    );
  }
}
