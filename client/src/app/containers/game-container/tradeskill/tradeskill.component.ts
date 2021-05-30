import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { clamp, cloneDeep, groupBy, sortBy } from 'lodash';

import { calculateTradeskillLevelFromXP, calculateTradeskillXPRequiredForLevel,
  IPlayer, IRecipe, Tradeskill } from '../../../../interfaces';
import { GameState, HideTradeskillWindow, HideWindow } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

import * as skillDescs from '../../../../assets/content/_output/skilldescs.json';
import * as allRecipes from '../../../../assets/content/_output/recipes.json';
import { AssetService } from '../../../services/asset.service';
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
  public knownRecipesArray: Array<{ category: string; recipes: IRecipe[] }> = [];
  public skill = 0;
  public skillPercent = 0;
  public skillName: string;

  public chosenCraft: string;

  constructor(
    private store: Store,
    private assetService: AssetService,
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
      this.chosenCraft = '';
      this.knownRecipes = {};
      this.knownRecipesArray = [];
    });
  }

  ngOnDestroy() {}

  chooseRecipe(name: string) {
    this.chosenCraft = name;
  }

  craft(name: string) {
    this.gameService.sendCommandString(`craft ${name}`);
  }

  itemDesc(item: string): string {
    const realItem = this.assetService.getItem(item);
    return realItem.desc;
  }

  itemTies(item: string): boolean {
    const realItem = this.assetService.getItem(item);
    return realItem.binds;
  }

  private setPlayer(player: IPlayer) {
    this.player = player;
  }

  private getPlayerSkillXP(): number {
    return (this.player.tradeskills || {})[this.tradeskillInfo.tradeskill.toLowerCase()] ?? 0;
  }

  private getPlayerSkill(): number {
    if (!this.player) return 0;

    const curXP = this.getPlayerSkillXP();
    const skill = calculateTradeskillLevelFromXP(curXP);
    return skill;
  }

  private updateRecipes() {
    if (!this.tradeskillInfo || !this.tradeskillInfo.tradeskill || !this.player) return;

    if (this.getPlayerSkillXP() === this.skillPercent) return;

    const skill = this.getPlayerSkill();

    let knownRecipes = recipes.filter(x => x.recipeType === this.tradeskillInfo.tradeskill.toLowerCase())
           .filter(x => x.requireSkill ? x.requireSkill <= skill : true)
           .filter(x => x.requireClass ? x.requireClass.includes(this.player.baseClass) : true)
           .filter(x => x.requireLearn ? this.player.learnedRecipes.includes(x.name) : true);

    knownRecipes.forEach(x => x._pointChance = 25 * clamp((x.maxSkillForGains - skill), 0, 4));

    knownRecipes = sortBy(knownRecipes, x => x.name);

    this.knownRecipes = groupBy(
      knownRecipes,
      (recipe) => recipe.category
    );

    this.knownRecipesArray = [];
    Object.keys(this.knownRecipes).forEach(category => {
      this.knownRecipesArray.push({ category, recipes: this.knownRecipes[category] });
    });
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
