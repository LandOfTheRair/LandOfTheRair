import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { GameOption } from '../../interfaces';
import { SettingsState } from '../../stores';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {

  @Select(SettingsState.options) options$: Observable<Record<GameOption, any>>;

  private opts: Partial<Record<GameOption, any>> = {}; ;

  public get musicVolume(): number {
    return (this.opts[GameOption.SoundMusicVolume] || 0) / 100;
  }

  public get sfxVolume(): number {
    return (this.opts[GameOption.SoundSFXVolume] || 0) / 100;
  }

  public get playBGM(): boolean {
    return this.opts[GameOption.SoundBGM];
  }

  public get playSFX(): boolean {
    return this.opts[GameOption.SoundSFX];
  }

  public get nostalgicSound(): boolean {
    return this.opts[GameOption.SoundNostalgia];
  }

  constructor() {}

  init() {
    this.options$.subscribe(opts => {
      this.opts = opts;
    });
  }

}
