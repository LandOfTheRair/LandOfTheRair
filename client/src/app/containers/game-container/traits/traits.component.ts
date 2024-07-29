import { Component } from '@angular/core';
import { Select } from '@ngxs/store';

import { sum } from 'lodash';
import { Observable, Subscription } from 'rxjs';

import {
  IAccount,
  IClassTraitTree,
  IPlayer,
  isSubscribed,
  ITrait,
  ITraitTreeTrait,
} from '../../../../interfaces';
import { AccountState, GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as allTraitTrees from '../../../../assets/content/_output/trait-trees.json';
import * as allTraits from '../../../../assets/content/_output/traits.json';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-traits',
  templateUrl: './traits.component.html',
  styleUrls: ['./traits.component.scss'],
})
export class TraitsComponent {
  @Select(GameState.player) player$: Observable<IPlayer>;
  @Select(AccountState.account) account$: Observable<IAccount>;

  playerSub: Subscription;
  accountSub: Subscription;

  public player: IPlayer;
  public traitTree: IClassTraitTree;

  public currentTree = -1;

  public buildSlots: number[] = [];

  private get currentTreeTraits() {
    if (this.currentTree >= 0) {
      return this.player.traits.savedBuilds[this.currentTree]?.traits || {};
    }

    return this.player.traits.traitsLearned || {};
  }

  constructor(
    private modalService: ModalService,
    public uiService: UIService,
    public gameService: GameService,
  ) {
    this.playerSub = this.player$
      .pipe(takeUntilDestroyed())
      .subscribe((p) => this.setPlayer(p));
    this.accountSub = this.account$
      .pipe(takeUntilDestroyed())
      .subscribe((a) => this.setAccount(a));
  }

  private setPlayer(player: IPlayer) {
    if (!player) {
      this.player = null;
      this.traitTree = null;
      this.currentTree = -1;
      return;
    }

    this.player = player;
    this.traitTree = allTraitTrees[player.baseClass];
  }

  private setAccount(account: IAccount) {
    if (!account) {
      this.buildSlots = [];
      return;
    }

    const numSlots = isSubscribed(account) ? 6 : 3;
    this.buildSlots = Array(numSlots)
      .fill(0)
      .map((_, i) => i);
  }

  public changeTree(newTree: number) {
    this.currentTree = newTree;
  }

  public formatTooltip(treeTrait: ITraitTreeTrait, trait: ITrait): string {
    let base = trait.desc.split('$').join('');
    if (treeTrait.requires) {
      base = `${base} Requires ${this.getTrait(treeTrait.requires).name}.`;
    }

    return base;
  }

  public getTrait(traitName: string): ITrait {
    return allTraits[traitName];
  }

  public getTraitInTree(trait: string): ITraitTreeTrait {
    return this.traitTree.allTreeTraits[trait];
  }

  public traitsSpent(tree: string): number {
    const allSkills = Object.keys(this.currentTreeTraits)
      .filter((k) => this.currentTreeTraits[k] > 0)
      .filter((k) => this.getTraitInTree(k)?.treeName === tree)
      .map((k) => this.currentTreeTraits[k]);

    return sum(allSkills);
  }

  public getTraitLevel(traitName: string): number {
    if (this.currentTree !== -1) return this.currentTreeTraits[traitName] ?? 0;

    return this.player.allTraits[traitName] ?? 0;
  }

  public getTraitBoughtLevel(traitName: string): number {
    return this.currentTreeTraits[traitName] ?? 0;
  }

  public canBuyTrait(trait: string): boolean {
    if (this.currentTree !== -1) return false;

    const traitRef = this.getTraitInTree(trait);

    const reqLevel = traitRef.isAncient ? 0 : traitRef.requiredLevel;

    return (
      (traitRef.isAncient
        ? this.player.traits.ap > 0
        : this.player.traits.tp > 0) &&
      this.getTraitBoughtLevel(trait) < traitRef.maxLevel &&
      this.player.level >= reqLevel &&
      (traitRef.requires
        ? this.getTraitBoughtLevel(traitRef.requires) >=
          this.getTraitInTree(traitRef.requires).maxLevel
        : true)
    );
  }

  public tryToBuyTrait(trait: ITraitTreeTrait, $event): void {
    if (!this.canBuyTrait(trait.name)) return;

    const finalize = () =>
      this.gameService.sendCommandString(`!learntrait ${trait.name}`);

    if ($event.shiftKey) {
      finalize();
      return;
    }

    this.modalService
      .confirm('Buy Trait', 'Are you sure you want to buy this trait?')
      .subscribe((res) => {
        if (!res) return;

        finalize();
      });
  }

  public loadBuild(tree: number) {
    this.modalService
      .confirm(
        'Load Build',
        `Are you sure you want to load this build from slot ${tree + 1}?`,
      )
      .subscribe((res) => {
        if (!res) return;

        this.gameService.sendCommandString(`!loadbuild ${tree}`);
      });
  }

  public saveBuild(tree: number) {
    this.modalService
      .confirm(
        'Save Build',
        `Are you sure you want to save this build in slot ${tree + 1}?`,
      )
      .subscribe((res) => {
        if (!res) return;

        this.gameService.sendCommandString(`!savebuild ${tree}`);
      });
  }
}
