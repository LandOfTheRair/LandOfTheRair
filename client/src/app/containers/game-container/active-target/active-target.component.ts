import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { select } from '@ngxs/store';

import { get } from 'lodash';

import { FOVVisibility, ICharacter } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { hostilityLevelFor } from '../../../_shared/helpers';
import { GameService } from '../../../services/game.service';
import { OptionsService } from '../../../services/options.service';

@Component({
  selector: 'app-active-target',
  templateUrl: './active-target.component.html',
  styleUrls: ['./active-target.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveTargetComponent {
  public gameService = inject(GameService);
  public optionService = inject(OptionsService);

  public player = select(GameState.player);
  public target = select(GameState.currentTarget);

  public isInFOV = computed(() => {
    const player = this.player();
    const target = this.target();

    if (!player || !target) return false;

    const diffX = target.x - player.x;
    const diffY = target.y - player.y;

    return get(player.fov, [diffX, diffY]) >= FOVVisibility.CanSee;
  });

  public shouldShow = computed(
    () =>
      this.player() &&
      this.target() &&
      this.target().hp.current > 0 &&
      this.isInFOV(),
  );

  public targetHealth = computed(() =>
    ((this.target().hp.current / this.target().hp.maximum) * 100).toFixed(2),
  );

  public targetHealthValue = computed(() => {
    if (this.optionService.showHPValueInsteadOfPercent) {
      return `${this.target().hp.current.toLocaleString()} / ${this.target().hp.maximum.toLocaleString()}`;
    }

    return this.targetHealth() + '%';
  });

  public hostility = computed(() => {
    return hostilityLevelFor(this.player(), this.target() as ICharacter);
  });

  public level = computed(() => this.target().level);

  public isDifficult = computed(
    () => this.target().level > this.player().level + 5,
  );

  public direction = computed(() =>
    this.gameService.directionTo(
      this.player(),
      this.target() as ICharacter,
      false,
    ),
  );

  public effects = computed(() => {
    const target = this.target();

    if (!target) return [];

    return [
      ...target.effects.buff,
      ...target.effects.debuff,
      ...target.effects.incoming,
      ...target.effects.outgoing,
    ];
  });
}
