import { Component, inject } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LobbyState } from '../../../stores';
import { GameService } from '../../services/game.service';
import { OptionsService } from '../../services/options.service';

@Component({
  selector: 'app-lobby-container',
  templateUrl: './lobby-container.component.html',
  styleUrls: ['./lobby-container.component.scss'],
})
export class LobbyContainerComponent {
  @Select(LobbyState.lastSessionStats) stats$: Observable<any>;

  public optionsService = inject(OptionsService);
  public gameService = inject(GameService);
}
