import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { cloneDeep } from 'lodash';
import { Observable, Subscription } from 'rxjs';

import { IPlayer, Skill } from '../../../../interfaces';
import { GameState, HideTrainerWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { ModalService } from '../../../services/modal.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss'],
})
export class TrainerComponent {
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.currentPosition) curPos$: Observable<{
    x: number;
    y: number;
  }>;
  @Select(GameState.currentTrainerWindow) trainer$: Observable<any>;
  @Select(GameState.inGame) inGame$: Observable<any>;

  private lastPos = { x: 0, y: 0 };

  public trainerInfo: any = {};
  public activeSkill: Skill;

  trainerInfoSub: Subscription;
  posSub: Subscription;
  gameStatusSub: Subscription;

  public readonly skills = [
    Skill.Sword,
    Skill.Shortsword,
    Skill.Dagger,
    Skill.Axe,
    Skill.Mace,
    Skill.Staff,
    Skill.Martial,
    Skill.Polearm,
    Skill.TwoHanded,
    Skill.Ranged,
    Skill.Throwing,
    Skill.Thievery,
    Skill.Wand,
    Skill.Conjuration,
    Skill.Restoration,
  ];

  constructor(
    private store: Store,
    private modalService: ModalService,
    public uiService: UIService,
    public gameService: GameService,
  ) {
    this.posSub = this.curPos$.pipe(takeUntilDestroyed()).subscribe((pos) => {
      if (!pos) return;
      if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;

      if (this.trainerInfo.npcUUID) {
        this.store.dispatch(new HideTrainerWindow());
        this.store.dispatch(new HideWindow('trainer'));
      }
    });

    this.trainerInfoSub = this.trainer$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.trainerInfo = cloneDeep(data || {});
      });

    this.gameStatusSub = this.inGame$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.store.dispatch(new HideTrainerWindow());
        this.store.dispatch(new HideWindow('trainer'));
      });
  }

  assess() {
    this.gameService.sendCommandString(
      `#${this.trainerInfo.npcUUID}, assess ${this.activeSkill}`,
    );
  }

  train() {
    this.gameService.sendCommandString(`#${this.trainerInfo.npcUUID}, train`);
  }

  ancient() {
    this.gameService.sendCommandString(`#${this.trainerInfo.npcUUID}, ancient`);
  }

  recall() {
    this.gameService.sendCommandString(`#${this.trainerInfo.npcUUID}, recall`);
  }

  warp() {
    this.gameService.sendCommandString(
      `#${this.trainerInfo.npcUUID}, guildteleport`,
    );
  }

  trainSkill() {
    this.gameService.sendCommandString(
      `#${this.trainerInfo.npcUUID}, trainskill ${this.activeSkill}`,
    );
  }

  resetTraits() {
    this.modalService
      .confirm(
        'Reset Traits',
        'Are you sure you want to reset your entire trait tree?',
      )
      .subscribe((res) => {
        if (!res) return;

        this.gameService.sendCommandString(
          `#${this.trainerInfo.npcUUID}, reset`,
        );
      });
  }
}
