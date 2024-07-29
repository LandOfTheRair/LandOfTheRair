import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import { get } from 'lodash';

import {
  FOVVisibility,
  ICharacter,
  IStatusEffect,
} from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-active-target',
  templateUrl: './active-target.component.html',
  styleUrls: ['./active-target.component.scss'],
})
export class ActiveTargetComponent implements OnInit {
  @Select(GameState.player) player$: Observable<ICharacter>;
  @Select(GameState.currentTarget) currentTarget$: Observable<ICharacter>;

  public player: ICharacter;
  public target: ICharacter;

  playerSub: Subscription;
  targetSub: Subscription;

  public get isInFOV(): boolean {
    if (!this.player || !this.target) return false;

    const diffX = this.target.x - this.player.x;
    const diffY = this.target.y - this.player.y;

    return get(this.player.fov, [diffX, diffY]) >= FOVVisibility.CanSee;
  }

  public get shouldShow() {
    return (
      this.player && this.target && this.target.hp.current > 0 && this.isInFOV
    );
  }

  public get targetHealth() {
    return ((this.target.hp.current / this.target.hp.maximum) * 100).toFixed(2);
  }

  public get targetHealthValue() {
    if (this.optionService.showHPValueInsteadOfPercent) {
      return `${this.target.hp.current.toLocaleString()} / ${this.target.hp.maximum.toLocaleString()}`;
    }

    return this.targetHealth + '%';
  }

  public get hostility() {
    return this.gameService.hostilityLevelFor(this.player, this.target);
  }

  public get level() {
    return this.target.level;
  }

  public get isDifficult() {
    return this.target.level > this.player.level + 5;
  }

  public get direction() {
    return this.gameService.directionTo(this.player, this.target, false);
  }

  public get effects() {
    if (!this.target) return [];

    return [
      ...this.target.effects.buff,
      ...this.target.effects.debuff,
      ...this.target.effects.incoming,
      ...this.target.effects.outgoing,
    ];
  }

  constructor(
    public gameService: GameService,
    public optionService: OptionsService,
  ) {}

  ngOnInit() {
    this.playerSub = this.player$.subscribe((p) => (this.player = p));
    this.targetSub = this.currentTarget$.subscribe((t) => (this.target = t));
  }

  trackEffectBy(effect: IStatusEffect) {
    return effect.uuid;
  }
}
