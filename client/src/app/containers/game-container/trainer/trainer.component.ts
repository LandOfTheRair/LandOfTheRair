import { Component, computed, effect, inject } from '@angular/core';
import { select, Store } from '@ngxs/store';

import { cloneDeep } from 'lodash';

import { Skill } from '../../../../interfaces';
import { GameState, HideTrainerWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { ModalService } from '../../../services/modal.service';

import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss'],
})
export class TrainerComponent {
  public player = select(GameState.player);
  public curPos = select(GameState.currentPosition);
  public trainer = select(GameState.currentTrainerWindow);
  public inGame = select(GameState.inGame);

  private lastPos = { x: 0, y: 0 };

  public trainerData = computed(() => cloneDeep(this.trainer()));
  public activeSkill: Skill;

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

  private store = inject(Store);
  private modalService = inject(ModalService);
  public uiService = inject(UIService);
  public gameService = inject(GameService);

  constructor() {
    effect(
      () => {
        const pos = this.curPos();

        if (!pos) return;
        if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;

        if (this.trainerData()?.npcUUID) {
          this.store.dispatch(new HideTrainerWindow());
          this.store.dispatch(new HideWindow('trainer'));
        }
      },
      { allowSignalWrites: true },
    );

    effect(
      () => {
        this.inGame();
        this.store.dispatch(new HideTrainerWindow());
        this.store.dispatch(new HideWindow('trainer'));
      },
      { allowSignalWrites: true },
    );
  }

  assess() {
    this.gameService.sendCommandString(
      `#${this.trainerData().npcUUID}, assess ${this.activeSkill}`,
    );
  }

  train() {
    this.gameService.sendCommandString(`#${this.trainerData().npcUUID}, train`);
  }

  ancient() {
    this.gameService.sendCommandString(
      `#${this.trainerData().npcUUID}, ancient`,
    );
  }

  recall() {
    this.gameService.sendCommandString(
      `#${this.trainerData().npcUUID}, recall`,
    );
  }

  warp() {
    this.gameService.sendCommandString(
      `#${this.trainerData().npcUUID}, guildteleport`,
    );
  }

  trainSkill() {
    this.gameService.sendCommandString(
      `#${this.trainerData().npcUUID}, trainskill ${this.activeSkill}`,
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
          `#${this.trainerData().npcUUID}, reset`,
        );
      });
  }
}
