import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { select } from '@ngxs/store';

import { GameState, SettingsState } from '../../../../stores';

import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-guild',
  templateUrl: './guild.component.html',
  styleUrls: ['./guild.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildComponent {
  public activeWindow = select(SettingsState.activeWindow);
  public player = select(GameState.player);

  public gameService = inject(GameService);
}
