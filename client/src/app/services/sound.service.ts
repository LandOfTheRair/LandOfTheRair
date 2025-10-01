import { effect, inject, Injectable } from '@angular/core';
import { select } from '@ngxs/store';
import { Howl } from 'howler';

import { GameOption, GameServerResponse } from '../../interfaces';
import { GameState, SettingsState } from '../../stores';
import { AssetService } from './asset.service';
import { OptionsService } from './options.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private currentBGM: Howl;
  private curBGM: string;

  public inGame = select(GameState.inGame);
  public bgm = select(GameState.currentBGM);
  public options = select(SettingsState.options);

  private assetService = inject(AssetService);
  private optionsService = inject(OptionsService);
  private socketService = inject(SocketService);

  constructor() {
    effect(() => {
      this.options();
      if (!this.currentBGM) return;
      this.currentBGM.volume(this.optionsService.musicVolume);
    });

    effect(() => {
      const inGame = this.inGame();
      const bgm = this.bgm();
      const options = this.options();

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
    });
  }

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
    return `${this.assetService.assetBaseUrl}/assets/${path}`;
  }
}
