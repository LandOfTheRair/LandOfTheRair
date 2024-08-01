import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { select } from '@ngxs/store';
import { LobbyState } from '../../../stores';
import { GameService } from '../../services/game.service';
import { OptionsService } from '../../services/options.service';

@Component({
  selector: 'app-lobby-container',
  templateUrl: './lobby-container.component.html',
  styleUrls: ['./lobby-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyContainerComponent {
  public stats = select(LobbyState.lastSessionStats);

  public optionsService = inject(OptionsService);
  public gameService = inject(GameService);
}
