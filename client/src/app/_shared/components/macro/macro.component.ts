import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { select } from '@ngxs/store';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BaseClass, IMacro, IPlayer } from '../../../../interfaces';
import { GameState } from '../../../../stores';
import { MacrosService } from '../../../services/macros.service';

@Component({
  selector: 'app-macro',
  templateUrl: './macro.component.html',
  styleUrls: ['./macro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacroComponent {
  public macroService = inject(MacrosService);
  public player = select(GameState.player);

  // private cooldownDisplayValue = new BehaviorSubject<number>(0);
  public cooldownDisplay = signal<string>('');
  cooldownSub: Subscription;

  public size = input('normal');
  public macroRef = input<IMacro>();
  public isActive = input<boolean>(false);
  public disableEffects = input<boolean>(false);
  public showTooltip = input<boolean>(true);
  public disabled = input<boolean>(false);
  public cooldown = input<number>(0);

  public background = computed(() => this.macroRef()?.bgColor ?? '#ccc');
  public foreground = computed(() => this.macroRef()?.color ?? '');
  public iconName = computed(() => this.macroRef()?.icon ?? '');
  public macroName = computed(() => this.macroRef()?.name ?? '');
  public macroTooltip = computed(() => this.macroRef()?.tooltipDesc ?? '');
  public macroKeybind = computed(() => {
    if (!this.macroRef()) {
      return '';
    }
    return this.macroService.buildMacroString(this.macroRef());
  });

  constructor() {
    const cooldownObs = toObservable(this.cooldown);

    this.cooldownSub = interval(100)
      .pipe(takeUntilDestroyed())
      .pipe(switchMap(() => cooldownObs))
      .subscribe((v) => {
        if (Date.now() > v) {
          this.cooldownDisplay.set('');
          return;
        }

        const numberValue = Math.abs((Date.now() - v) / 1000);

        if (numberValue < 10) {
          this.cooldownDisplay.set(numberValue.toFixed(1));
          return;
        }

        this.cooldownDisplay.set(numberValue.toFixed(0));
      });
  }

  reformatTooltipTextForPlayer(player: IPlayer, text: string): string {
    if (player.baseClass === BaseClass.Thief) {
      return text.split('MP').join('HP');
    }

    return text;
  }
}
