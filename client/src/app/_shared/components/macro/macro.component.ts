import { Component, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BaseClass, IMacro, IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';
import { MacrosService } from '../../../services/macros.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-macro',
  templateUrl: './macro.component.html',
  styleUrls: ['./macro.component.scss'],
})
export class MacroComponent implements OnInit {
  @Select(GameState.player) player$: Observable<IPlayer>;

  private cooldownDisplayValue = new BehaviorSubject<number>(0);
  public cooldownDisplay: string;
  cooldownSub: Subscription;

  @Input() public size = 'normal';
  @Input() public macroRef: IMacro;
  @Input() public isActive: boolean;
  @Input() public disableEffects = false;
  @Input() public showTooltip = true;
  @Input() public disabled = false;
  @Input() public set cooldown(val: number) {
    this.cooldownDisplayValue.next(val);
  }

  get background() {
    return this.macroRef?.bgColor ?? '#ccc';
  }

  get foreground() {
    return this.macroRef?.color ?? '';
  }

  get iconName() {
    return this.macroRef?.icon ?? '';
  }

  get macroName() {
    return this.macroRef?.name ?? '';
  }

  get macroTooltip() {
    return this.macroRef?.tooltipDesc ?? '';
  }

  get macroKeybind() {
    if (!this.macroRef) {
      return '';
    }
    return this.macroService.buildMacroString(this.macroRef);
  }

  constructor(public macroService: MacrosService) {}

  ngOnInit() {
    this.cooldownSub = interval(100)
      .pipe(switchMap(() => this.cooldownDisplayValue))
      .subscribe((v) => {
        if (Date.now() > v) {
          this.cooldownDisplay = '';
          return;
        }

        const numberValue = Math.abs((Date.now() - v) / 1000);

        if (numberValue < 10) {
          this.cooldownDisplay = numberValue.toFixed(1);
          return;
        }

        this.cooldownDisplay = numberValue.toFixed(0);
      });
  }

  reformatTooltipTextForPlayer(player: IPlayer, text: string): string {
    if (player.baseClass === BaseClass.Thief) {
      return text.split('MP').join('HP');
    }

    return text;
  }
}
