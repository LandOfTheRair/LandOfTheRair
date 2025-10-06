import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { timer } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IStatusEffect } from '@lotr/interfaces';
import * as effectData from '../../../assets/content/_output/effect-data.json';

@Component({
  selector: 'app-effect-icon',
  template: `
    <div
      class="status-effect"
      [class.fading]="currentTicksLeft() > 0 && currentTicksLeft() <= 15"
      [ngClass]="['effect-' + effect().effectName]"
    >
      <app-icon
        size="esmall"
        [name]="iconName()"
        [fgColor]="color()"
        [bgColor]="bgColor()"
        [matTooltip]="tooltip()"
      ></app-icon>
      @if (charges() > 0) {
        <div class="status-remaining">{{ charges() }}</div>
      }

      <!---->
      @if (buildUpPercent() > 0) {
        <div class="status-remaining">{{ buildUpPercent() }}%</div>
      }

      <!---->
      @if (currentTicksLeft() > 0 && charges() === 0) {
        <div class="status-remaining">
          {{ currentTicksLeft() }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        cursor: pointer;
      }

      .status-effect {
        position: relative;
        display: flex;
        text-align: center;

        max-width: 28px;
        max-height: 28px;
      }

      .status-remaining {
        position: absolute;
        bottom: -5px;
        font-size: 0.8rem;
        font-weight: bold;
        text-align: center;
        width: 100%;
        z-index: 20;
        text-shadow:
          -1px -1px 0 #fff,
          1px -1px 0 #fff,
          -1px 1px 0 #fff,
          1px 1px 0 #fff;
        color: #000;
        user-select: none;
      }

      .fading {
        animation: buff-fading 500ms ease-in-out infinite alternate;
      }

      @keyframes buff-fading {
        0% {
          opacity: 0.3;
        }
        100% {
          opacity: 1;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffectIconComponent {
  public effect = input.required<IStatusEffect>();
  public defaultTransparent = input<boolean>();

  public currentTicksLeft = signal<number>(0);

  public iconData = computed(
    () =>
      (
        effectData[this.effect().effectRef] ||
        effectData[this.effect().effectName]
      ).tooltip,
  );

  public iconName = computed(
    () =>
      this.effect().effectInfo.effectIcon ||
      (this.iconData()?.icon ?? 'undefined'),
  );

  public bgColor = computed(
    () => this.iconData()?.bgColor || (this.defaultTransparent() ? '' : '#ccc'),
  );

  public color = computed(
    () =>
      this.effect().effectInfo.tooltipColor ||
      (this.iconData()?.color ?? '#000'),
  );

  public tooltip = computed(() => {
    const eff = this.effect();

    const effName = eff.effectInfo.tooltipName || eff.effectName;

    const effDesc =
      eff.effectInfo.tooltip || eff.tooltip || this.iconData()?.desc || '???';
    const sourceName = eff.sourceName;

    let baseTooltip = effDesc;

    if (effName && !effName.includes('Attribute')) {
      baseTooltip = `${effName}: ${baseTooltip}`;
    }

    if (sourceName) baseTooltip = `${baseTooltip} [${sourceName}]`;

    return baseTooltip;
  });

  public charges = computed(() => this.effect().effectInfo.charges ?? 0);

  public buildUpPercent = computed(() => Math.floor(
      (this.effect().effectInfo.buildUpCurrent /
        this.effect().effectInfo.buildUpMax) *
        100,
    ));

  public getRemainingTicks() {
    const eff = this.effect();
    if (eff.endsAt === -1 || eff.effectInfo.hideTicks) {
      return 0;
    }
    return Math.floor((eff.endsAt - Date.now()) / 1000);
  }

  constructor() {
    timer(0, 1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentTicksLeft.set(this.getRemainingTicks());
      });
  }
}
