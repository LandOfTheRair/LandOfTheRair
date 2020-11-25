import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Howl } from 'howler';
import { combineLatest, Observable } from 'rxjs';

import { BGM, GameServerResponse } from '../../interfaces';
import { GameState } from '../../stores';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private currentBGM: Howl;

  @Select(GameState.inGame) inGame$: Observable<boolean>;
  @Select(GameState.currentBGM) bgm$: Observable<BGM>;

  constructor(private socketService: SocketService) {}

  init() {
    this.socketService.registerComponentCallback(this.constructor.name, GameServerResponse.PlaySFX, ({ sfx }) => {
      const sfxRef = new Howl({
        src: [this.getSFX(`${sfx}.mp3`)]
      });

      sfxRef.play();
    });

    combineLatest([
      this.inGame$,
      this.bgm$
    ])
    .subscribe(([inGame, bgm]) => {
      if (!inGame || !bgm) {
        if (this.currentBGM) this.currentBGM.stop();
        return;
      }

      if (this.currentBGM) this.currentBGM.stop();

      this.currentBGM = new Howl({
        src: [this.getBGM(`${bgm}.mp3`)],
        loop: true
      });

      this.currentBGM.play();
    });
  }

  private getBGM(path: string): string {
    return this.getAudio(`bgm/${path}`);
  }

  private getSFX(path: string): string {
    return this.getAudio(`sfx/${path}`);
  }

  private getAudio(path: string): string {
    return `assets/${path}`;
  }

}
