import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';

import { sum } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Observable, Subscription } from 'rxjs';

import { IClassTraitTree, IPlayer, ITrait, ITraitTreeTrait } from '../../../../interfaces';
import { GameState } from '../../../../stores';

import { GameService } from '../../../services/game.service';
import { UIService } from '../../../services/ui.service';

import * as allTraitTrees from '../../../../assets/content/_output/trait-trees.json';
import * as allTraits from '../../../../assets/content/_output/traits.json';
import { ModalService } from '../../../services/modal.service';

@AutoUnsubscribe()
@Component({
  selector: 'app-traits',
  templateUrl: './traits.component.html',
  styleUrls: ['./traits.component.scss']
})
export class TraitsComponent implements OnInit, OnDestroy {

  @Select(GameState.player) player$: Observable<IPlayer>;

  playerSub: Subscription;

  public player: IPlayer;
  public traitTree: IClassTraitTree;

  constructor(
    private modalService: ModalService,
    public uiService: UIService,
    public gameService: GameService
  ) { }

  ngOnInit() {
    this.playerSub = this.player$.subscribe(p => this.setPlayer(p));
  }

  ngOnDestroy() {}

  private setPlayer(player: IPlayer) {
    if (!player) {
      this.player = null;
      this.traitTree = null;
      return;
    }

    this.player = player;
    this.traitTree = allTraitTrees[player.baseClass];
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
    const allSkills = Object.keys(this.player.traits.traitsLearned)
      .filter(k => this.player.traits.traitsLearned[k] > 0)
      .filter(k => this.getTraitInTree(k)?.treeName === tree)
      .map(k => this.player.traits.traitsLearned[k]);

    return sum(allSkills);
  }

  public getTraitLevel(traitName: string): number {
    return this.player.allTraits[traitName] ?? 0;
  }

  public getTraitBoughtLevel(traitName: string): number {
    return this.player.traits.traitsLearned[traitName] ?? 0;
  }

  public canBuyTrait(trait: string): boolean {
    const traitRef = this.getTraitInTree(trait);

    return (traitRef.isAncient ? this.player.traits.ap > 0 : this.player.traits.tp > 0)
        && this.getTraitBoughtLevel(trait) < traitRef.maxLevel
        && this.player.level >= traitRef.requiredLevel
        && (
          traitRef.requires
            ? this.getTraitBoughtLevel(traitRef.requires) >= this.getTraitInTree(traitRef.requires).maxLevel
            : true
          );
  }

  public tryToBuyTrait(trait: ITraitTreeTrait): void {
    if (!this.canBuyTrait(trait.name)) return;

    this.modalService.confirm('Buy Trait', 'Are you sure you want to buy this trait?')
      .subscribe(res => {
        if (!res) return;

        this.gameService.sendCommandString(`!learntrait ${trait.name}`);
      });
  }

}
