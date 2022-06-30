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

  private opts: Partial<Record<GameOption, any>> = {};

  // interface options
  public get rightClickSend(): boolean {
    return this.opts[GameOption.RightClickCMDSend];
  }

  public get enterToggleCMD(): boolean {
    return this.opts[GameOption.EnterToggleCMD];
  }

  public get classicNPCChat(): boolean {
    return this.opts[GameOption.NoNPCModals];
  }

  public get autoAttack(): boolean {
    return this.opts[GameOption.AutoAttack];
  }

  public get autoJoin(): boolean {
    return this.opts[GameOption.AutoJoin];
  }

  public get dontAttackGreys(): boolean {
    return this.opts[GameOption.DontAttackGreys];
  }

  public get hideLobbyInGame(): boolean {
    return this.opts[GameOption.HideLobbyWhilePlaying];
  }

  public get lockWindows(): boolean {
    return this.opts[GameOption.LockWindows];
  }

  public get suppressZeroDamage(): boolean {
    return this.opts[GameOption.SuppressZeroDamage];
  }

  public get suppressOutgoingDoT(): boolean {
    return this.opts[GameOption.SuppressOutgoingDoT];
  }

  public get stopItemAnimations(): boolean {
    return this.opts[GameOption.NoItemAnimations];
  }

  public get pinLastTarget(): boolean {
    return this.opts[GameOption.PinLastTarget];
  }

  public get dyingBorderPercent(): number {
    return this.opts[GameOption.DyingBorderPercent];
  }

  public get canShowDyingBorder(): boolean {
    return this.opts[GameOption.DyingBorderWidth] !== 0;
  }

  public get dyingBorderWidth(): string {
    return this.opts[GameOption.DyingBorderWidth] + 'px';
  }

  public get sortFriendlies(): string {
    return this.opts[GameOption.ShouldSortFriendly];
  }

  public get sortByDistance(): string {
    return this.opts[GameOption.ShouldSortDistance];
  }

  public get shrinkCharacterBoxes(): string {
    return this.opts[GameOption.ShrinkCharacterBoxes];
  }

  public get lockerTabs(): boolean {
    return this.opts[GameOption.LockerTabs];
  }

  public get debugUI(): boolean {
    return this.opts[GameOption.DebugUI];
  }

  public get sendBannerMessagesToChat(): boolean {
    return this.opts[GameOption.SendBannerMessagesToChat];
  }

  public get biggerGroundWindow(): boolean {
    return this.opts[GameOption.BiggerGroundWindow];
  }

  public get showHPValueInsteadOfPercent(): boolean {
    return this.opts[GameOption.ShowHPValueInsteadOfPercent];
  }

  // sound options
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

  // other options
  public get autoExec(): string {
    return this.opts[GameOption.OtherAutoExec];
  }

  // custom options
  public get customCSS(): string {
    return this.opts[GameOption.CustomCSS];
  }

  constructor() {}

  init() {
    this.options$.subscribe(opts => {
      this.opts = opts;
      this.updateCustomCSS();
    });
  }

  updateCustomCSS() {
    const css = this.customCSS;

    let styleElement = document.getElementById('custom-css');

    // if we have no CSS, we bail. also, if we have a style element, we delete it
    if (!css) {
      if (styleElement) {
        styleElement.remove();
      }
      return;
    }

    // if we have no style element, create one
    if (!styleElement) {
      const head = document.getElementsByTagName('head')[0];
      styleElement = document.createElement('style');
      styleElement.id = 'custom-css';
      (styleElement as any).type = 'text/css';

      head.appendChild(styleElement);
    }

    styleElement.textContent = '';
    styleElement.appendChild(document.createTextNode(css));

  }

}
