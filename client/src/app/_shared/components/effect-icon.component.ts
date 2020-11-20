
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subscription, timer } from 'rxjs';

import * as effectData from '../../../assets/content/_output/effect-data.json';
import { IStatusEffect } from '../../../interfaces';

@AutoUnsubscribe()
@Component({
  selector: 'app-effect-icon',
  template: `
    <div class="status-effect" [class.fading]="currentTicksLeft > 0 && currentTicksLeft <= 15">
      <app-icon size="small" [name]="iconName" [fgColor]="color" [bgColor]="bgColor" [matTooltip]="tooltip"></app-icon>
      <div class="status-remaining" *ngIf="charges > 0">{{ charges }}</div>
      <div class="status-remaining" *ngIf="buildUpPercent > 0">{{ buildUpPercent }}%</div>
      <div class="status-remaining" *ngIf="currentTicksLeft > 0 && charges === 0">{{ currentTicksLeft }}</div>
    </div>
  `,
  styles: [`
    :host {
      cursor: pointer;
    }

    .status-effect {
      position: relative;
      display: flex;
      text-align: center;

      max-width: 32px;
      max-height: 32px;
    }

    .status-remaining {
      position: absolute;
      bottom: -5px;
      font-size: 0.8rem;
      font-weight: bold;
      text-align: center;
      width: 100%;
      z-index: 20;
      text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
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
  `]
})
export class EffectIconComponent implements OnInit, OnDestroy {

  @Input() public effect: IStatusEffect;
  @Input() public defaultTransparent: boolean;

  public currentTicksLeft = 0;
  tickSub: Subscription;

  public get iconData() {
    return effectData[this.effect.effectName].tooltip;
  }

  public get iconName() {
    return this.iconData?.icon ?? 'undefined';
  }

  public get bgColor() {
    return this.iconData?.bgColor ?? (this.defaultTransparent ? '' : '#ccc');
  }

  public get color() {
    return this.iconData?.color ?? '#000';
  }

  public get tooltip() {
    let baseTooltip = this.effect.tooltip || this.iconData?.desc || '';
    if (this.effect.sourceName) baseTooltip = `${this.effect.effectName}: ${baseTooltip} [${this.effect.sourceName}]`;
    return baseTooltip;
  }

  public get charges() {
    return this.effect.effectInfo.charges ?? 0;
  }

  public get buildUpPercent() {
    return this.effect.effectInfo.buildUpPercent ?? 0;
  }

  public get ticks(): number {
    if (this.effect.endsAt === -1) return 0;
    return Math.floor((this.effect.endsAt - Date.now()) / 1000);
  }

  ngOnInit() {
    this.tickSub = timer(0, 1000)
      .subscribe(() => {
        this.currentTicksLeft = this.ticks;
      });
  }

  ngOnDestroy() {}

}
