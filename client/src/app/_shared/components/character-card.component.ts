import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameServerResponse, ICharacter, ItemSlot } from '../../../interfaces';
import { GameState } from '../../../stores';
import { GameService } from '../../services/game.service';
import { OptionsService } from '../../services/options.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-character-card',
  template: `
    <div class="char-card" [attr.uuid]="char.uuid" [class.disabled]="disabled">
      @if (currentTarget$ | async; as currentTarget) {
        @if (currentTarget.uuid === char.uuid) {
          <div class="char-target">
            <div class="outer circle"></div>
            <div class="middle circle"></div>
            <div class="inner circle"></div>
            <div class="innermost circle"></div>
          </div>
        }
      }
    
      <div class="char-left-container">
        <div
          class="char-health d-flex justify-content-center"
          [ngClass]="[barClass()]"
          >
          <app-life-heart [target]="char"></app-life-heart>
        </div>
    
        @if (!optionService.shrinkCharacterBoxes) {
          <div
            class="char-direction vertical-center"
            >
            {{ directionTo() }}
          </div>
        }
      </div>
    
      <div class="char-middle">
        <div
          class="effect-container"
          [class.animate]="effect"
          [ngClass]="[effect]"
        ></div>
    
        <div class="char-title" [ngClass]="[barClass()]">
          <div class="char-name">
            {{ char.name }}
          </div>
        </div>
    
        @if (!optionService.shrinkCharacterBoxes) {
          <div class="char-gear">
            <div class="gear-item right">
              <app-item
                size="xsmall"
                [showDesc]="false"
                [showEncrust]="false"
                [showCount]="false"
                [item]="rightHand"
              ></app-item>
            </div>
            <div class="gear-item armor">
              <app-item
                size="xsmall"
                [showDesc]="false"
                [showEncrust]="false"
                [showCount]="false"
                [item]="armorItem"
              ></app-item>
            </div>
            <div class="gear-item left">
              <app-item
                size="xsmall"
                [showDesc]="false"
                [showEncrust]="false"
                [showCount]="false"
                [item]="leftHand"
              ></app-item>
            </div>
          </div>
        }
      </div>
    </div>
    `,
  styles: [
    `
      .char-card {
        display: flex;
        flex-direction: row;
        max-height: 50px;
        margin-top: 4px;
        position: relative;
      }

      .char-card.disabled {
        opacity: 0.6;
      }

      .char-target {
        position: absolute;
        width: 26px;
        top: 20px;
        right: 20px;
      }

      .circle {
        position: absolute;
        border-radius: 50%;
        border: 1px solid #000;
        left: 0;
        right: 0;
        margin: auto;

        top: 50%;
        transform: translateY(-50%);
        z-index: 650;
      }

      .circle.outer {
        width: 24px;
        height: 24px;
        background-color: #b20000;
      }

      .circle.middle {
        width: 18px;
        height: 18px;
        background-color: #fff;
      }

      .circle.inner {
        width: 12px;
        height: 12px;
        background-color: #b20000;
      }

      .circle.innermost {
        width: 6px;
        height: 6px;
        background-color: #fff;
      }

      .char-left-container {
        width: 20px;
        max-width: 20px;
        margin-left: 2px;
        margin-top: 2px;
      }

      .char-health {
        border: 1px solid #000;
        border-right: none;
        border-bottom: none;
        min-height: 18px;
        max-height: 18px;
        border-bottom: 1px solid #000;
      }

      .char-direction {
        border-left: 1px solid #000;
        border-bottom: 1px solid #000;
        border-right: none;
        color: #fff;
        max-height: 18px;
        font-weight: bold;
      }

      .friendly {
        background-color: #003a00;
        color: white;
      }

      .hostile {
        background-color: #b20000;
        color: white;
      }

      .neutral {
        background-color: #bbb;
        color: black;
      }

      .stealth {
        background-color: #000;
        color: white;
      }

      .char-middle {
        max-width: 120px;
        max-height: 50px;

        position: relative;

        display: flex;
        flex-direction: column;

        border: 1px solid #000;
        border-left: none;

        margin-top: 2px;

        cursor: cell;
      }

      .char-title {
        height: 18px;
        width: 96px;
        font-weight: bold;
      }

      .char-name {
        user-select: none;
        padding-left: 2px;
        padding-right: 2px;
        font-size: 0.8rem;
        letter-spacing: 0.5px;
        font-weight: 500;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: clip;
        max-width: 92px;
        line-height: 16px;
        min-height: 17px;
        max-height: 17px;
      }

      .char-gear {
        display: flex;
        flex-direction: row;
      }

      .gear-item {
        width: 32px !important;
        height: 32px !important;
        outline: 1px solid #000;
        background: #b7b19e;
        background: linear-gradient(
          135deg,
          #b7b19e 0%,
          #777466 65%,
          #36332c 100%
        );
      }

      .effect-container {
        z-index: 25;
        width: 100%;
        height: calc(100% + 3px);
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
      }

      .animate.hit-min {
        animation: hit-min 500ms ease-out alternate;
      }

      @keyframes hit-min {
        0% {
          box-shadow: inset 0 0 10px #f00;
        }
        100% {
          box-shadow: inset 0 0 30px #e00;
        }
      }

      .animate.hit-mid {
        animation: hit-mid 500ms ease-out alternate;
      }

      @keyframes hit-mid {
        0% {
          box-shadow: inset 0 0 10px #900;
        }
        100% {
          box-shadow: inset 0 0 50px #800;
        }
      }

      .animate.hit-max {
        animation: hit-max 500ms ease-out alternate;
      }

      @keyframes hit-max {
        0% {
          box-shadow: inset 0 0 10px #400;
        }
        100% {
          box-shadow: inset 0 0 80px #300;
        }
      }

      .animate.block-dodge,
      .animate.block-miss {
        animation: block-soft 500ms ease-out alternate;
      }

      @keyframes block-soft {
        0% {
          box-shadow: inset 0 0 10px #ddd;
        }
        100% {
          box-shadow: inset 0 0 50px #ccc;
        }
      }

      .animate.block-armor,
      .animate.block-weapon,
      .animate.block-shield,
      .animate.block-offhand {
        animation: block-hard 500ms ease-out alternate;
      }

      @keyframes block-hard {
        0% {
          box-shadow: inset 0 0 10px #aaa;
        }
        100% {
          box-shadow: inset 0 0 80px #888;
        }
      }

      .animate.hit-magic,
      .animate.hit-buff {
        animation: hit-magic 500ms ease-out alternate;
      }

      @keyframes hit-magic {
        0% {
          box-shadow: inset 0 0 10px #00f;
        }
        100% {
          box-shadow: inset 0 0 60px #00a;
        }
      }

      .animate.hit-heal {
        animation: hit-heal 500ms ease-out alternate;
      }

      @keyframes hit-heal {
        0% {
          box-shadow: inset 0 0 10px #0f0;
        }
        100% {
          box-shadow: inset 0 0 60px #0a0;
        }
      }
    `,
  ],
})
export class CharacterCardComponent implements OnInit, OnDestroy {
  @Select(GameState.currentTarget) currentTarget$: Observable<ICharacter>;

  @Input() public disabled: boolean;
  @Input() public origin: ICharacter;
  @Input() public char: ICharacter;

  public effect = '';
  private cfxId: string;

  public get armorItem() {
    return (
      this.char.items?.equipment?.[ItemSlot.Robe2] ||
      this.char.items?.equipment?.[ItemSlot.Robe1] ||
      this.char.items?.equipment?.[ItemSlot.Armor]
    );
  }

  public get rightHand() {
    return this.char.items?.equipment?.[ItemSlot.RightHand];
  }

  public get leftHand() {
    return this.char.items?.equipment?.[ItemSlot.LeftHand];
  }

  public get isCurrentTarget(): boolean {
    return false;
  }

  constructor(
    private socketService: SocketService,
    private gameService: GameService,
    public optionService: OptionsService,
  ) {}

  ngOnInit() {
    this.cfxId = this.constructor.name + '-' + this.char.uuid;

    this.socketService.registerComponentCallback(
      this.cfxId,
      GameServerResponse.PlayCFX,
      ({ defenderUUID, effect }) => {
        if (defenderUUID !== this.char.uuid) return;

        this.effect = effect;
        setTimeout(() => {
          this.effect = '';
        }, 900);
      },
    );
  }

  ngOnDestroy() {
    this.socketService.unregisterComponentCallbacks(this.cfxId);
  }

  public directionTo() {
    return this.gameService.directionTo(this.origin, this.char, false);
  }

  public barClass() {
    return this.gameService.hostilityLevelFor(this.origin, this.char);
  }
}
