import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';
import { Skill } from '../../../../interfaces';
import { GameState, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';

import { UIService } from '../../../services/ui.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent implements OnInit, OnDestroy {

  @Select(GameState.currentPosition) curPos$: Observable<{ x: number, y: number }>;
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
    Skill.Restoration
  ];

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.posSub = this.curPos$.subscribe((pos) => {
      if (!pos) return;
      if (pos.x === this.lastPos.x && pos.y === this.lastPos.y) return;
      this.lastPos.x = pos.x;
      this.lastPos.y = pos.y;
      this.store.dispatch(new HideWindow('trainer'));
    });

    this.trainerInfoSub = this.trainer$.subscribe(data => {
      this.trainerInfo = data;
    });

    this.gameStatusSub = this.inGame$.subscribe((d) => {
      this.store.dispatch(new HideWindow('trainer'));
    });
  }

  ngOnDestroy() {}

  assess() {
    this.gameService.sendCommandString(`#${this.trainerInfo.npcName}, assess ${this.activeSkill}`);
  }

}
