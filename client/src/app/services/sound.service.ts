import { inject, Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Howl } from 'howler';
import { combineLatest, Observable } from 'rxjs';

import { BGM, GameOption, GameServerResponse } from '../../interfaces';
import { GameState, SettingsState } from '../../stores';
import { OptionsService } from './options.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private currentBGM: Howl;
  private curBGM: string;

  @Select(GameState.inGame) inGame$: Observable<boolean>;
  @Select(GameState.currentBGM) bgm$: Observable<BGM>;
  @Select(SettingsState.options) options$: Observable<Record<GameOption, any>>;

  private optionsService = inject(OptionsService);
  private socketService = inject(SocketService);

  init() {
    this.socketService.registerComponentCallback(
      'Sound',
      GameServerResponse.PlaySFX,
      ({ sfx }) => {
        if (!this.optionsService.playSFX) return;

        const sfxRef = new Howl({
          src: [this.getSFX(sfx)],
          volume: this.optionsService.sfxVolume,
        });

        sfxRef.play();
      },
    );

    this.options$.subscribe(() => {
      if (!this.currentBGM) return;
      this.currentBGM.volume(this.optionsService.musicVolume);
    });

    combineLatest([this.inGame$, this.bgm$, this.options$]).subscribe(
      ([inGame, bgm, options]) => {
        if (!inGame || !bgm || !this.optionsService.playBGM) {
          this.curBGM = '';
          if (this.currentBGM) this.currentBGM.stop();
          return;
        }

        const fullBGM = options[GameOption.SoundNostalgia]
          ? `${bgm}-nostalgia`
          : bgm;
        if (fullBGM === this.curBGM) return;

        this.curBGM = fullBGM;

        this.updateBGM(fullBGM);
      },
    );
  }

  private updateBGM(bgm: string): void {
    if (!this.optionsService.playBGM) return;

    if (!bgm) {
      if (this.currentBGM) this.currentBGM.stop();
      return;
    }

    if (this.currentBGM) this.currentBGM.stop();

    this.currentBGM = new Howl({
      src: [this.getBGM(bgm)],
      volume: this.optionsService.musicVolume,
      loop: true,
    });

    this.currentBGM.play();
  }

  private getBGM(path: string): string {
    return this.getAudio(`bgm/${path}.mp3`);
  }

  private getSFX(path: string): string {
    return this.getAudio(`sfx/${path}.mp3`);
  }

  private getAudio(path: string): string {
    return `assets/${path}`;
  }
}
