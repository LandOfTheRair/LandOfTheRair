import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { clamp, cloneDeep, groupBy } from 'lodash';

import { calculateTradeskillLevelFromXP, calculateTradeskillXPRequiredForLevel,
  IPlayer, IRecipe, Tradeskill } from '../../../../interfaces';
import { GameState, HideTradeskillWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

import * as skillDescs from '../../../../assets/content/_output/skilldescs.json';
import * as allRecipes from '../../../../assets/content/_output/recipes.json';
const recipes = (allRecipes as any).default || allRecipes;

@AutoUnsubscribe()
@Component({
  selector: 'app-tradeskill',
  templateUrl: './tradeskill.component.html',
  styleUrls: ['./tradeskill.component.scss']
})
export class TradeskillComponent implements OnInit, OnDestroy {

  @Select(GameState.currentTradeskillWindow) tradeskill$: Observable<any>;
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(GameState.inGame) inGame$: Observable<any>;

  gameStatusSub: Subscription;
  playerSub: Subscription;

  public tradeskillInfo: any = {};
  public player: IPlayer;
  public knownRecipes: Record<string, IRecipe[]> = {};
  public skill = 0;
  public skillPercent = 0;
  public skillName: string;

  constructor(
    private store: Store,
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.playerSub = combineLatest([
      this.player$,
      this.tradeskill$
    ]).subscribe(([player, tradeskill]) => {
      this.setPlayer(player);
      this.tradeskillInfo = cloneDeep(tradeskill || {});
      this.updateSkill();
      this.updateRecipes();
    });

    this.gameStatusSub = this.inGame$.subscribe(() => {
      this.store.dispatch(new HideTradeskillWindow());
      this.store.dispatch(new HideWindow('tradeskill'));
    });
  }

  ngOnDestroy() {}

  private setPlayer(player: IPlayer) {
    this.player = player;
  }

  private updateRecipes() {
    if (!this.tradeskillInfo || !this.tradeskillInfo.tradeskill) return;

    this.knownRecipes = groupBy(
      recipes.filter(x => x.recipeType === this.tradeskillInfo.tradeskill.toLowerCase()),
      (recipe) => recipe.category
    );
  }

  private updateSkill() {
    if (!this.tradeskillInfo || !this.tradeskillInfo.tradeskill || !this.player) {
      this.skill = 0;
      this.skillPercent = 0;
      return;
    }

    const curXP = (this.player.tradeskills || {})[this.tradeskillInfo.tradeskill.toLowerCase()] ?? 0;

    const skill = calculateTradeskillLevelFromXP(curXP);

    const curLevelXP = skill === 0 ? 0 : calculateTradeskillXPRequiredForLevel(skill);
    const nextLevelXP = skill === 0 ? 5 : calculateTradeskillXPRequiredForLevel(skill + 1);

    const percent = clamp((curXP - curLevelXP) / (nextLevelXP - curLevelXP) * 100, 0, 99);

    this.skill = skill;
    this.skillPercent = percent;
    this.skillName = this.getSkillDescription(this.tradeskillInfo.tradeskill.toLowerCase(), skill);
  }

  private getSkillDescription(skill: Tradeskill, skillLevel: number): string {
    return skillDescs[skill][Math.min(skillDescs[skill].length - 1, skillLevel)] ?? 'Unpracticed';
  }

}
